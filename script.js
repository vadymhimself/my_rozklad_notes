
var DEFAULT_TEXT = chrome.i18n.getMessage("defTextNote");
var scheduleKey;
var newScheduleKey; // new key for compatibility with rozklad.org.ua

var nicEditOptions = {
	fullPanel : false, 
	iconsPath : chrome.extension.getURL('images/nicEditorIcons.gif'), 
	buttonList : ['bold','italic','underline', 'strikethrough', 'forecolor', 'link', 'unlink', 'removeformat']
}

var myNicEditor = new nicEditor(nicEditOptions);

function initNotes() {
	var index = 0;
	$("td").each(function() {
		// exclude headers
		var row = Math.floor(index / 7);
		if (index % 7 != 0 && row % 6 != 0) {
			var pair = $(this);
			// put .note element into table cell
			pair.append("<p class='note neverwritten'></p>");
			var note = pair.find(".note");
			// restore note data from chrome store
			restore(note, index);
			// set click list list listeners
			initInteraction(pair, index);
		}
		index++;
	})
}

$.fn.putText = function(text) {
	var html = text;
	var div = document.createElement("div");
	div.innerHTML = html;
	var strippedText = div.textContent || div.innerText || "";
	if (strippedText.length < 2 || text == undefined || text == DEFAULT_TEXT || text.length < 1) {
		$(this).text(DEFAULT_TEXT);
		$(this).addClass("neverwritten");
	} else {
		// no need to replace breaks now
		// var newText = text.replace(/\r?\n/g, '<br />');
		$(this).removeClass("neverwritten");
		// put html into note
		$(this).html(text);
	}
};

$.fn.getText  = function() {
	var text = $(this).html();
	//.replace(/<br>|<br \/>/g, "\n");
	return text;
}

jQuery.fn.selectText = function(){
	this.find('input').each(function() {
		if($(this).prev().length == 0 || !$(this).prev().hasClass('p_copy')) { 
			$('<p class="p_copy" style="position: absolute; z-index: -1;"></p>').insertBefore($(this));
		}
		$(this).prev().html($(this).val());
	});
	var doc = document;
	var element = this[0];
	if (doc.body.createTextRange) {
		var range = document.body.createTextRange();
		range.moveToElementText(element);
		range.select();
	} else if (window.getSelection) {
		var selection = window.getSelection();        
		var range = document.createRange();
		range.selectNodeContents(element);
		selection.removeAllRanges();
		selection.addRange(range);
	}
};

function initInteraction(td, index) {
	var note = td.find(".note");
	note.click(function(e) {

		// check if link ckicked
		if($(e.target).is("a")) return true;

		note.css("display", "none");
		td.append("<textarea id='edited'></textarea>");
		myNicEditor.panelInstance('edited');
		var nicInstance = myNicEditor.instanceById('edited');
		nicInstance.setContent(note.getText());
		var textdiv = $(".nicEdit-main");
		textdiv.selectText();

		// when focus lost
		textdiv.blur(function() {
			if($('.nicEdit-pane').length){
				// some panes are currently opened - dont close editview
			} else {
				var text = myNicEditor.instanceById('edited').getContent();
				note.putText(text);
			// save data to local storage
			store(text, index);
			// remove all textareas
			myNicEditor.removeInstance('edited');
			td.find("textarea").remove();
			note.css("display", "block");
			return false;
		}

	});
		return true;
	});
}

function store(noteText, id) {
	var key = scheduleKey + '_pair_' + id;
	var json = {};
	if (noteText == DEFAULT_TEXT) {
		json[key] = "";
	} else {
		json[key] = noteText;
	}
	chrome.storage.sync.set(json, function() {
		console.log('Note saved: k:' + key + " val:"  + json[key]);
	});
};

function restore(note, id) {
	var key = scheduleKey + '_pair_' + id;
	chrome.storage.sync.get(key, function(result) {
		note.putText(result[key]);
	});
}

$(document).ready(function() {
	scheduleKey = $("#aspnetForm").attr("action").match(/\\?\w=[\w-]+/)[0].substring(2);
	initNotes();
});
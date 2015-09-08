
var DEFAULT_TEXT = "Write your notes here";
var scheduleKey;

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
			// set clicklisteners
			initInteraction(pair, index);
		}
		index++;
	})
}

// function for putting carret
$.fn.selectRange = function(start, end) {
	if(!end) end = start; 
	return this.each(function() {
		if (this.setSelectionRange) {
			this.focus();
			this.setSelectionRange(start, end);
		} else if (this.createTextRange) {
			var range = this.createTextRange();
			range.collapse(true);
			range.moveEnd('character', end);
			range.moveStart('character', start);
			range.select();
		}
	});
};

$.fn.putText = function(text) {
	if (text == undefined || text == DEFAULT_TEXT || text.length < 1) {
		$(this).text(DEFAULT_TEXT);
		$(this).addClass("neverwritten");
	} else {
		var newText = text.replace(/\r?\n/g, '<br />');
		$(this).removeClass("neverwritten");
		$(this).html(newText);
	}
};

$.fn.getText  = function() {
	var text = $(this).html().replace(/<br>|<br \/>/g, "\n");
	return text;
}

function initInteraction(td, index) {
	var note = td.find(".note");
	note.click(function() {
		note.css("display", "none");
		td.append("<textarea></textarea>");
		var textarea = td.find("textarea");
		textarea.autoResize( {extraSpace: 0});
		textarea.text(note.getText());
		textarea.trigger("change.dynSiz");
		textarea.selectRange(textarea.text().length);

		// when focus lost
		textarea.blur(function() {
			var text = textarea.val();
			note.putText(text);
			// save data to local storage
			store(text, index);
			// remove all textareas
			td.find("textarea").each(function() {$(this).remove()});
			note.css("display", "block");
		});
		return false;
	});
}

function store(noteText, id) {
	var key = scheduleKey + '_pair_' + id;
	var json = {};
	json[key] = noteText;
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
chrome.runtime.onInstalled.addListener(function(details){
	var locale = chrome.i18n.getMessage("@@ui_locale");
	if (locale != "en" || locale != "uk") locale = "uk";
	var updatePage = locale + "/thankyou.html";
	var thisVersion = chrome.runtime.getManifest().version;
	if(details.reason == "install" || details.reason == "update" ){
		chrome.tabs.create({ url: updatePage });
	} 
});

chrome.browserAction.onClicked.addListener(function (tab) { //Fired when User Clicks ICON
	var urlToOpen = "http://rozklad.kpi.ua/";
	chrome.tabs.create({ url: urlToOpen });
});
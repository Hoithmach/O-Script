// ==UserScript==
// @name         O-Script
// @namespace    https://github.com/Hoithmach/O-Script
// @version      0.1
// @description  Open full size artwork in a new tab with one keypress
// @author       Hoithmach
// @license      GPL-3.0; https://www.gnu.org/licenses/gpl-3.0.txt
// @match        https://gelbooru.com/index.php?page=post&s=view&id=*
// @match        https://danbooru.donmai.us/posts/*
// @match        https://yande.re/post/show/*
// @match        https://booru.allthefallen.moe/posts/*
// @match        https://lolibooru.moe/post/show/*
// @match        https://safebooru.org/index.php?page=post&s=view&id=*
// @match        https://www.zerochan.net/*
// @match        https://www.pixiv.net/en/artworks/*
// @match        https://rule34.paheal.net/post/view/*
// @match        https://*.fanbox.cc/*
// @icon         https://raw.githubusercontent.com/Hoithmach/O-Script/master/o.png
// @require      https://code.jquery.com/jquery-3.6.2.min.js
// @require      https://gist.github.com/BrockA/2625891/raw/9c97aa67ff9c5d56be34a55ad6c18a314e5eb548/waitForKeyElements.js
// @grant        GM_openInTab
// @run-at       document-end
// @noframes
// ==/UserScript==
var link, li, a;
var img_count = 1;

// pixiv/zerochan/fanbox/rule34 are handled individually
const originalimage = ["gelbooru.com", "safebooru.org"];
const vieworiginal = ["booru.allthefallen.moe", "danbooru.donmai.us"]
const viewlargerversion = ["yande.re", "lolibooru.moe"]

function pixiv() {
    var img_qs = document.querySelector("div[aria-label='Preview']")  // Will return null if pixiv gallery is a single image
    if (img_qs) {
      img_count = parseInt(document.querySelector("div[aria-label='Preview']").textContent.split("/")[1]);
    };
    link = []
    var img_url_template = document.querySelector("a[href*='img-original'][href*='_p0.'").getAttribute("href");
    var iut_array = img_url_template.split("_p0.");
    var img_ext = iut_array[1];
    var img_url_base = iut_array[0] + "_p";
    for (var c = 0; c < img_count; c++) {
        link.push(img_url_base + c.toString() + "." + img_ext)
    }
    return link;
}

function fanbox() {
    var img_elements = document.querySelectorAll("a[href*='downloads.fanbox.cc']");
    var img_count = img_elements.length;
    link = [];
    for (var c = 0; c < img_count; c++) {
        link.push(img_elements[c].href);
    }
    return link;
}

function open() {
    var img;
    if (typeof link == "undefined" || link == null) {
        return alert("[O-Script]\nError: Link not found");
    }
    if (typeof link == "string") {
        GM_openInTab(link)
    } else if (typeof link == "object") {
        link.reverse()
        if (img_count < 5) {
            for (img of link) {
                GM_openInTab(img);
            }
        } else {
            if (confirm("[O-Script]\nImages to open: " + img_count.toString() + "\nProceed?")) {
                for (img of link) {
                    GM_openInTab(img);
                }
            }
        }
    }
}

(function() {
    'use strict';
    if (originalimage.includes(window.location.hostname)) {
        a = document.getElementsByTagName("a");
        for (var i of a) {
            if (i.textContent.toLowerCase() == "original image") {
                link = i.getAttribute("href");
            }
        }
    } else if (vieworiginal.includes(window.location.hostname)) {
        li = document.getElementById("post-option-view-original");
        link = li.getElementsByTagName("a")[0].href;
    } else if (viewlargerversion.includes(window.location.hostname)) {
        link = document.getElementById("highres-show").href;
    } else if (window.location.hostname == "www.zerochan.net") {
        link = document.getElementsByClassName("preview")[0].href;
    } else if (window.location.hostname == "www.pixiv.net") {
        link = waitForKeyElements("div[class='sc-1qpw8k9-0 gTFqQV']", pixiv);
    } else if (window.location.hostname == "rule34.paheal.net") {
        link = document.getElementById("main_image").src;
    } else if (window.location.hostname.endsWith("fanbox.cc")) {
        link = waitForKeyElements("a[href*='downloads.fanbox.cc']", fanbox);
    }

    document.addEventListener("keydown", function(key) {
        if ((key.key == "o") && (! key.ctrlKey) && (! key.altKey) && (! key.shiftKey)) {
            open()
        };
    });

})();

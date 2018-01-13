$(function() {
    var body = $(document.body);
    var owner = body.attr("owner");
    var repository = body.attr("repository");
    var branch = body.attr("branch");

    createBadge(owner, repository, branch, "markdown");
    createBadge(owner, repository, branch, "html");

    $.getJSON("https://thebusybiscuit.github.io/builds/" + owner + "/" + repository + "/" + branch + "/builds.json", function(builds) {
        var last_successful = builds.last_successful;

        // Get currently selected Build
        var current = builds.latest;

        if(window.location.hash) {
            var hash = window.location.hash.substr(1);

            if (!isNaN(hash)) {
                var id = parseInt(hash);
                if (id > 0 && id < builds.latest) {
                    current = id;
                }
            }
        }

        // Load currently selected Build
        loadBuild(owner, repository, builds, current);

        // "Last Successful Build" Link
        var link_last_successful = $("#link_last_successful_build");

        link_last_successful.text("#" + last_successful);
        link_last_successful.attr("href", "#" + last_successful);

        $(".build_header").text("Builds (" + builds.latest + ")");

        // Build List
        var list_builds = $("#buildlist");

        list_builds.html("");
        for (var i = builds.latest; i > 0; i--) {
            list_builds.append(build(builds, i));
        }

        // Add Click Events
        $(".trigger").click(function() {
            loadBuild(owner, repository, builds, parseInt($(this).attr("href").substr(1)));
        });
    });

    $("#badge_click").click(function() {
        $(".overlay").css("display", "");
    });

    $("#close_badge").click(function() {
        $(".overlay").css("display", "none");
    });

    function build(builds, id) {
        var stroke = "rgb(110, 110, 110)";
        var color = "rgb(160, 160, 160)";
        var name = "#" + id;

        if (builds[id].status === "SUCCESS") {
            stroke = "rgb(60, 100, 60)";
            color = "rgb(20, 255, 20)";
        }
        else if (builds[id].status === "FAILURE") {
            stroke = "rgb(100, 60, 60)";
            color = "rgb(255, 20, 20)";
        }

        if (builds[id].candidate === "RELEASE") {
            name = builds[id].tag;
        }

        var html = "<div class=\"build";

        if (builds[id].candidate === "RELEASE") html += " release";
        else html += " dev";

        html += "\" id=\"build_" + id + "\">";
        html += "<svg class=\"build_child build_state\">";
        html += "<circle cx=\"12\" cy=\"29\" r=\"11\" stroke=\"" + stroke + "\" stroke-width=\"2\" fill=\"" + color + "\"/></svg>";
        html += "<a class=\"trigger build_child link_build\" href=\"#" + id + "\">" + name + "</a>";
        html += "<a class=\"trigger build_child link_date\" href=\"#" + id + "\">" + builds[id].date + "</a>";
        html += "<a class=\"build_child link_commit\" href=https://github.com/" + owner + "/" + repository + "/commit/" + builds[id].sha + ">#" + builds[id].sha.substr(0, 5) + "</a>";
        html += "</div>";

        return html;
    }

    function loadBuild(owner, repository, builds, id) {
        var stroke = "rgb(110, 110, 110)";
        var color = "rgb(160, 160, 160)";

        if (builds[id].status === "SUCCESS") {
            stroke = "rgb(60, 100, 60)";
            color = "rgb(20, 255, 20)";
        }
        else if (builds[id].status === "FAILURE") {
            stroke = "rgb(100, 60, 60)";
            color = "rgb(255, 20, 20)";
        }

        var current_icon = "<circle cx=\"31\" cy=\"31\" r=\"23\" stroke=\"" + stroke + "\" stroke-width=\"2\" fill=\"" + color + "\"/>";

        $("#current_icon").html(current_icon);
        $("#current_status").text(builds[id].status);

        if (builds[id].status === "SUCCESS") {
            $("#download_section").css("display", "");

            var download_jar = $("#current_download_jar");
            download_jar.text(repository + "-" + id + ".jar");
            download_jar.attr("href", repository + "-" + id + ".jar");
        }
        else {
            $("#download_section").css("display", "none");
        }

        if (builds[id].candidate === "RELEASE") {
            $("#current_name").text(repository + " - " + builds[id].tag);
            $("#tag_section").css("display", "");

            var current_tag = $("#current_tag");
            current_tag.attr("href", "https://github.com/" + owner +"/" + repository + "/releases/tag/" + builds[id].tag);
            current_tag.text(builds[id].tag);
        }
        else {
            $("#current_name").text(repository + " - #" + id);
            $("#tag_section").css("display", "none");
        }

        var download_log = $("#current_download_log");
        download_log.text(repository + "-" + id + ".log");
        download_log.attr("href", repository + "-" + id + ".log");

        $("#current_tree").attr("href", "https://github.com/" + owner + "/" + repository + "/tree/" + builds[id].sha);

        if (builds[id].license === "") {
            $("#license_section").css("display", "none");
        }
        else {
            $("#license_section").css("display", "");

            var current_license = $("#current_license");
            current_license.attr("href", builds[id].license.url);
            current_license.text(builds[id].license.name);
        }

        var current_commit = $("#current_commit");
        current_commit.attr("href", "https://github.com/" + owner +"/" + repository + "/commit/" + builds[id].sha);
        current_commit.text("#" + builds[id].sha.substr(0, 5));

        $("#current_commit_avatar").attr("src", builds[id].avatar);
        $("#current_commit_committer").text(builds[id].author);
        $("#current_commit_date").text(builds[id].date);

        var msg = "\"" + builds[id].message + "\"";
        // Prevent XSS
        msg = msg.replace(/</g, "")
        msg = msg.replace(/>/g, "")

        var match = msg.match(/#[0-9]+/g);

        for (var i in match) {
            msg = msg.replace(match[i], "<a class=\"link_info\" href=https://github.com/" + owner + "/" + repository + "/issues/" + match[i].replace("#", "") + ">" + match[i] + "</a>");
        }

        $("#current_commit_message").html(msg);
    }
});

function createBadge(owner, repository, branch, language) {
    var url = "";

    if (language === "markdown") {
        url = "[![Build Status](https://thebusybiscuit.github.io/builds/" + owner + "/" + repository + "/" + branch + "/badge.svg)](https://thebusybiscuit.github.io/builds/" + owner + "/" + repository + "/" + branch + ")"
    }
    else if (language === "html") {
        url = "<a href=\"https://thebusybiscuit.github.io/builds/" + owner + "/" + repository + "/" + branch + "\"><img src=\"https://thebusybiscuit.github.io/builds/" + owner + "/" + repository + "/" + branch + "/badge.svg\" alt=\"Build Status\"/></a>";
    }

    $("#badge_" + language).attr("value", url);
    $("#copy_" + language).click(function() {
        $("#badge_" + language).select();
        document.execCommand("Copy");
    });
}

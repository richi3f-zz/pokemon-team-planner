function filterPkmn(option, checked) {
    // hide all Pokémon
    $("ol.picker li").addClass("filtered");
    // get selected generations
    var gens = []; var i = 0;
    $("#gen-filter option:selected").each(function() {
        gens[i++] = "." + $(this).val();
    });
    // get selected islands
    var islands = []; i = 0;
    $("#island-filter option:selected").each(function() {
        islands[i++] = "." + $(this).val();
    });
    // get selected types
    var types = []; i = 0;
    $("#type-filter option:selected").each(function() {
        var type = $(this).val();
        types[i++] = "." + type + "1";
        types[i++] = "." + type + "2";
    });
    // get selected resistances
    var resistances = []; i = 0;
    $("#resistance-filter option:selected").each(function() {
        resistances[i++] = ".immune2-" + $(this).val();
        resistances[i++] = ".resists-" + $(this).val();
    });
    // get selected areas
    var areas = []; i = 0;
    $("#area-filter option:selected").each(function() {
        areas[i++] = "." + $(this).val();
    });
    // get regional dex
    var isAlolaDex = $("#alola-dex").length > 0;
    var isKalosDex = $("#kalos-dex").length > 0;
    var isHoennDex = $("#hoenn-dex").length > 0;
    // get selected versions
    var includePkmnFromBothVersions = $("#version-filter [value=both]:selected").length > 0;
    // get evolution filters
    var includeNotFullyEvolvedPkmn = $("#evolution-filter [value=nfe]:selected").length > 0;
    var includeFullyEvolvedPkmn = $("#evolution-filter [value=fe]:selected").length > 0;
    var includeMegas = $("#evolution-filter [value=mega]:selected").length > 0;
    // show Pokémon that have at least one class of each array (generations, types, resistances, islands)
    $("ol.picker li").each(function() {
        var $this = $(this);
        if ($this.is(gens.join(',')) &&
           ($this.is(islands.join(',')) || !isAlolaDex) &&
           ($this.is(areas.join(',')) || !isKalosDex) &&
           ($this.is(types.join(',')) &&
            $this.is(resistances.join(',')))) {
            // filter by version
            if (isAlolaDex) {
                var includePkmnFromSun = $("#version-filter [value=sun]:selected").length > 0;
                var includePkmnFromMoon = $("#version-filter [value=moon]:selected").length > 0;
                if (($this.hasClass("sun") && !includePkmnFromSun) ||
                    ($this.hasClass("moon") && !includePkmnFromMoon) ||
                    (!$this.hasClass("sun") && !$this.hasClass("moon") && !includePkmnFromBothVersions)) {
                    return;
                }
            }
            if (isKalosDex) {
                var includePkmnFromX = $("#version-filter [value=x]:selected").length > 0;
                var includePkmnFromY = $("#version-filter [value=y]:selected").length > 0;
                if (($this.hasClass("x") && !includePkmnFromX) ||
                    ($this.hasClass("y") && !includePkmnFromY) ||
                    (!$this.hasClass("x") && !$this.hasClass("y") && !includePkmnFromBothVersions)) {
                    return;
                }
            }
            if (isHoennDex) {
                var includePkmnFromOmegaRuby = $("#version-filter [value=ruby]:selected").length > 0;
                var includePkmnFromAlphaSapphire = $("#version-filter [value=sapphire]:selected").length > 0;
                if (($this.hasClass("ruby") && !includePkmnFromOmegaRuby) ||
                    ($this.hasClass("sapphire") && !includePkmnFromAlphaSapphire) ||
                    (!$this.hasClass("ruby") && !$this.hasClass("sapphire") && !includePkmnFromBothVersions)) {
                    return;
                }
            }
            // check if Pokémon is tagged as NFE
            if ($this.hasClass("nfe")) {
                // if it is, check if filter is on
                if (!includeNotFullyEvolvedPkmn) {
                    return;
                }
            }
            else
            {
                // else, check if Pokémon is mega
                if ($this.children(":first").attr("class").includes("-mega")) {
                    // if it is, check if filter is on
                    if (!includeMegas) {
                        return;
                    }
                }
                // if it is not a mega, check if FE filter is on
                else if (!includeFullyEvolvedPkmn) {
                    return;
                }
            }
            // check if it is Silvally or Arceus, display only Normal Type when all types are selected
            if (!$this.hasClass("normal1") && ($this.children(":first").hasClass("arceus") || $this.children(":first").hasClass("silvally")) && types.length >= 36) {
                return;
            }
            $(this).removeClass("filtered");
        }
    });
}
function getRandomNumber(upperBound) {
    return Math.floor((Math.random() * upperBound) + 1);
}
function addPkmnToTeam($this) {
    var pkmnClass = $this.attr("class").split(' ')[1];
    var pkmnName = $this.text();
    if (typeof pkmnClass === "undefined") {
        return;
    }
    // check if picked Pokémon is a mega and if there is already one in the team
    if ($this.attr("class").includes("-mega") && $("ul.picked .art[class*=-mega]").length > 0)
    {
        // remove current Mega from team
        removePkmnFromTeam($("ul.picked .art[class*=-mega]").parent().parent());
    }
    var $slot = $("ul.picked .free").first();
    // check if there is free space in team, if not remove the Pokémon occupying the first team slot
    if ($slot.length <= 0)
    {
        // remove Pokémon from first team slot
        removePkmnFromTeam($("ul.picked li").first());
        // select empty team slot
        $slot = $("ul.picked .free").first();
    }
    $slot.removeClass("free");
    // get types in an array
    var j = 0;
    var types = [];
    var matches = $this.parent().attr("class").match(/[a-z]+[1-2](?!-)/g);
    for (var k = 0; k < matches.length; k++) {
        if (matches[k].startsWith("gen") || matches[k].startsWith("island")) {
            continue;
        }
        types[j++] = matches[k];
    }
    var $figure = $slot.find("figure");
    var $div = $slot.find(".info");
    $figure.attr("title", pkmnName);
    // add Pokémon art to slot
    $figure.children().addClass(pkmnClass);
    // add Pokémon name
    $div.find(".name").text(pkmnName);
    // add Pokémon types
    var typeAsClass = types[0].slice(0, -1);
    var typeAsText = types[0].charAt(0).toUpperCase() + types[0].slice(1, -1);
    addTypeToSpan($div.find(".type").eq(0), typeAsClass, typeAsText);
    $figure.attr("class", typeAsClass + "1");
    $div.attr("class", "info " + typeAsClass + "1");
    if (types.length > 1) {
        typeAsClass = types[1].slice(0, -1);
        typeAsText = types[1].charAt(0).toUpperCase() + types[1].slice(1, -1);
        addTypeToSpan($div.find(".type").eq(1), typeAsClass, typeAsText);
        $figure.addClass(typeAsClass + "2");
        $div.addClass(typeAsClass + "2");
    }
    // hide picked Pokémon
    $this.parent().addClass("picked");
    if (pkmnClass == "arceus" || pkmnClass == "silvally") {
        $("ol.picker .menu-sprite." + pkmnClass).each(function() {
            $(this).parent().addClass("hidden");
        });
    }
    // update team type analysis and URL hash
    updateTeamTypeAnalysis(pkmnClass);
    updateTeamHash();
}
function removePkmnFromTeam($this) {
    var pkmnClass = $this.find(".art").attr("class").split(' ')[1];
    if (typeof pkmnClass === "undefined") {
        return;
    }
    // update team type analysis
    updateTeamTypeAnalysis(pkmnClass, true);
    // make Pokémon visible again
    $("ol.picker .menu-sprite." + pkmnClass).parent().removeClass("picked");
    if (pkmnClass == "arceus" || pkmnClass == "silvally") {
        $("ol.picker .menu-sprite." + pkmnClass).each(function() {
            $(this).parent().removeClass("hidden");
        });
    }
    // update URL hash
    updateTeamHash();
    // reset slot
    $this.addClass("free");
    var $figure = $this.find("figure");
    var $div = $this.find(".info");
    $figure.find(".art").attr("class", "art");
    $figure.attr("title", "");
    $figure.attr("class", "unknown");
    $div.attr("class", "info unknown");
    $div.find(".name").text("???");
    $div.find(".type").attr("class", "type unknown");
    // send empty slot to last place
    $("ul.picked").append($this);
}
function addTypeToSpan($span, typeAsClass, typeAsText) {
    $span.removeClass("unknown");
    $span.addClass(typeAsClass);
    $span.attr("title", typeAsText);
    $span.text(typeAsText);
}
function updateTeamTypeAnalysis(pkmnName, removed) {
    if (typeof removed === "undefined") {
        removed = false;
    }
    $("#team-weaknesses .type").each(function() {
        // get current type
        var $this = $(this);
        var type = $this.attr("class").split(' ')[1];
        // check if Pokémon is weak to said type
        if ($("ol.picker .picked .menu-sprite." + pkmnName).parent().hasClass("weak2-" + type))
        {
            var $td = $this.find("td");
            // get current number of Pokémon weak to said type
            var numberPkmn = parseInt($td.text());
            // update the number
            numberPkmn += removed ? -1 : 1;
            $td.text(numberPkmn);
            $this.attr("title", numberPkmn + " Pokémon " + (numberPkmn == 1 ? "Is" : "Are")  + " Weak to the " + type.charAt(0).toUpperCase() + type.slice(1) + " Type!");
            // if number is too high, warn the user!
            if (numberPkmn > 2) {
                $this.addClass("warning");
            } else {
                $this.removeClass("warning");
            }
        }
    });
    $("#team-immunities .type").each(function() {
        // get current type
        var $this = $(this);
        var type = $this.attr("class").split(' ')[1];
        // check if Pokémon is immune to said type
        if ($("ol.picker .picked .menu-sprite." + pkmnName).parent().hasClass("immune2-" + type))
        {
            var $td = $this.find("td");
            // get current number of Pokémon resistant to said type
            var numberPkmn = parseInt($td.text());
            // update the number
            numberPkmn += removed ? -1 : 1;
            $td.text(numberPkmn);
            $this.attr("title", numberPkmn + " Pokémon " + (numberPkmn == 1 ? "Is" : "Are")  + " Immune to the " + type.charAt(0).toUpperCase() + type.slice(1) + " Type!");
        }
    });
    $("#team-resistances .type").each(function() {
        // get current type
        var $this = $(this);
        var type = $this.attr("class").split(' ')[1];
        // check if Pokémon resists said type
        if ($("ol.picker .picked .menu-sprite." + pkmnName).parent().hasClass("resists-" + type))
        {
            var $td = $this.find("td");
            // get current number of Pokémon resistant to said type
            var numberPkmn = parseInt($td.text());
            // update the number
            numberPkmn += removed ? -1 : 1;
            $td.text(numberPkmn);
            $this.attr("title", numberPkmn + " Pokémon Resist" + (numberPkmn == 1 ? 's' : '')  + " the " + type.charAt(0).toUpperCase() + type.slice(1) + " Type!");
        }
    });
}
function updateTeamHash() {
    var hashArray = [];
    $('li.picked a').each(function(){
        var $this = $(this);
        var pkmnClass = $this.attr("class").split(' ')[1];
        if (pkmnClass == "arceus" || pkmnClass == "silvally")
        {
            var type = $this.parent().attr("class").match(/[a-z]+1(?!-)/g);
            if (type.length < 1) {
                type = "normal";
            } else {
                type = type[0].slice(0, -1);
            }
            pkmnClass += "-" + type;
        }
        hashArray.push(pkmnClass);
    });
    window.location.hash = hashArray.join('+');
    $("#copy-url input").val(document.URL);
}
var TypeMatchup = {
    "normal": 1,
    "grass": 1,
    "fire": 1,
    "water": 1,
    "fighting": 1,
    "flying": 1,
    "poison": 1,
    "ground": 1,
    "rock": 1,
    "bug": 1,
    "ghost": 1,
    "electric": 1,
    "psychic": 1,
    "ice": 1,
    "dragon": 1,
    "dark": 1,
    "steel": 1,
    "fairy": 1
};
var type_matchups = {};
$(document).ready(function(){
    // parse xml with type matchup data
    $.get("static/type_data.xml", function(d){
        $(d).find("Type").each(function() {
            var $this = $(this);
            // create new type matchup object
            var current_matchup = Object.create(TypeMatchup);
            // apply immunity multiplier for every type in the <UnaffectedBy /> tag
            var types = $this.find("UnaffectedBy").text().toLowerCase().split(',');
            for (i = 0; i < types.length; i++) {
                current_matchup[types[i]] *= 0.0;
            }
            // apply resistance multiplier for every type in the <Resists /> tag
            types = $this.find("Resists").text().toLowerCase().split(',');
            for (i = 0; i < types.length; i++) {
                current_matchup[types[i]] *= 0.5;
            }
            // apply weakness multiplier for every type in the <WeakTo /> tag
            types = $this.find("WeakTo").text().toLowerCase().split(',');
            for (i = 0; i < types.length; i++) {
                current_matchup[types[i]] *= 2.0;
            }
            // get name of current type
            var type = $this.find("Name").text().toLowerCase();
            // save type matchup to dictionary
            type_matchups[type] = current_matchup;
        });
        // pick each Pokémon to add weak2, immune2, or resists classes
        $("ol.picker li").each(function() {
            var $this = $(this);
            // get the type of the Pokémon (which is a class)
            var i = 0;
            var types = [];
            var classes = $this.attr("class").split(" ");
            for (j= 0; j < classes.length; j++) {
                if (typeof type_matchups[classes[j].slice(0, -1)] != "undefined") {
                    types[i++] = classes[j].slice(0, -1);
                }
            }
            // create a blank type matchup
            var type_matchup = Object.create(TypeMatchup);
            if (types.length > 1) {
                // multiply each type matchup (primary & secondary) to create dual type matchup
                for (type in type_matchup) {
                    type_matchup[type] = type_matchups[types[0]][type] * type_matchups[types[1]][type];
                }
            } else {
                // copy primary type matchup
                for (type in type_matchup) {
                    type_matchup[type] = type_matchups[types[0]][type];
                }
            }
            // make immune to Ground if Pokémon has Levitate
            if ($this.hasClass("levitate")) {
                type_matchup.ground *= 0.0;
            }
            // add weak2 or resists classes
            for (type in type_matchup) {
                if (type_matchup[type] < 1.0) {
                    if (type_matchup[type] === 0.0) {
                        $this.addClass("immune2-" + type);
                    } else {
                        $this.addClass("resists-" + type);
                    }
                }
                else if (type_matchup[type] > 1.0) {
                    $this.addClass("weak2-" + type);
                }
            }
        });
        if(window.location.hash) {
            window.location.hash.substring(1).split('+').forEach(function(pkmnClass) {
                if (pkmnClass.startsWith("arceus") || pkmnClass.startsWith("silvally")) {
                    var classes = pkmnClass.split('-');
                    pkmnClass = classes[0];
                    var type = "";
                    if (classes.length > 1) {
                        type = classes[1] + "1";
                    } else {
                        type = "normal1";
                    }
                    $("ol.picker ." + type + " .menu-sprite." + pkmnClass).trigger("click");
                } else {
                    addPkmnToTeam($("ol.picker .menu-sprite." + pkmnClass));
                }
            });
        }
    });
    $("#team-weaknesses tr").each(function() {
        var type = $(this).find("th").text();
        $(this).attr("title", "Number of Pokémon Weak to the " + type + " Type");
    });
    $("ol.picker .menu-sprite").each(function() {
       $(this).parent().attr("title", $(this).text());
    });
    $("ol.picker .menu-sprite").click(function(e) {
        addPkmnToTeam($(this));
        e.preventDefault();
    });
    $("ul.picked li").click(function(e) {
        removePkmnFromTeam($(this));
        e.preventDefault();
    });
    $("select").multiselect({
        buttonWidth: '140px',
        numberDisplayed: 1,
        includeSelectAllOption: true,
        onChange: filterPkmn,
        onSelectAll: filterPkmn
    });
    $("select").multiselect("selectAll", false);
    if ($("#alola-dex").length > 0) {
        $('#evolution-filter').multiselect('deselect', ['mega']);
    }
    $("select").multiselect('updateButtonText');
    // show/hide team's weaknesses
    $("#team .button:not(#randomize)").click(function(e) {
        $("#team .more").toggleClass("hidden");
        $("#team .button:not(#randomize)").toggleClass("hidden");
        e.preventDefault();
    });
    // show/hide extra filters
    $("#filters .button").click(function(e) {
        $("#filters .more .filter").toggleClass("hidden");
        $("#filters .button").toggleClass("hidden");
        e.preventDefault();
    });
    $("#randomize").click(function(e) {
        // clear current team
        $("ul.picked li").each(function() {
            removePkmnFromTeam($(this));
        });
        // get filtered Pokémon
        var $filteredPkmn = $("ol.picker li:not(.filtered):not(.picked)");
        if ($filteredPkmn.length > 0)
        {
            var teamSize = 6;
            // if there are less than 6 available Pokémon, use that number
            if ($filteredPkmn.length < teamSize)
            {
                teamSize = $filteredPkmn.length;
            }
            // if only Megas are shown, limit team to 1
            var includeNotFullyEvolvedPkmn = $("#evolution-filter [value=nfe]:selected").length > 0;
            var includeFullyEvolvedPkmn = $("#evolution-filter [value=fe]:selected").length > 0;
            var includeMegas = $("#evolution-filter [value=mega]:selected").length > 0;
            if (includeMegas && !includeFullyEvolvedPkmn && !includeNotFullyEvolvedPkmn)
            {
                teamSize = 1;
            }
            for (var i = 0; i < teamSize; i++)
            {
                do
                {
                    // get random Pokémon
                    randomNumber = getRandomNumber($filteredPkmn.length) - 1;
                    $randomPkmn = $filteredPkmn.eq(randomNumber).find(".menu-sprite");
                    // check if mega and loop if a mega has already been rolled
                    isMega = $randomPkmn.attr("class").includes("-mega");
                } while (isMega && $("ul.picked .art[class*=-mega]").length > 0);
                // add random Pokémon to a slot
                addPkmnToTeam($randomPkmn);
                // get filtered Pokémon
                $filteredPkmn = $("ol.picker li:not(.filtered):not(.picked)");
            }
        }
        e.preventDefault();
    });
    // make Pokémon go up and down on mouse over
    var handle = 0;
    $("ol.picker li").hover(function() {
        var $pkmn = $(this);
        handle = setInterval(function() {
            $pkmn.toggleClass("up");
        }, 150);
    }, function() {
        $(this).removeClass("up");
        clearInterval(handle);
    });
    // set current URL
    $("#copy-url input").val(document.URL);
});
// copy feature
var clipboard = new Clipboard("#copy-url a");
clipboard.on("success", function() {
    var $button = $("#copy-url a");
    $button.text("Copied!");
    setTimeout(function() {
        $button.text("Copy");
    }, 3000);
});

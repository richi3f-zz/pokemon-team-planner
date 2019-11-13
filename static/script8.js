const battle_only_forms = ['cherrim-sunshine', 'aegislash-blade', 'wishiwashi-school'];
const clickOutsideDropdownMenuListener = (e) => {
    $target = $(e.target);
    if (!$target.closest('.filter.active :not(label)').length) {
        $('.filter.active .dropdown-menu').parent().removeClass('active');
        document.removeEventListener('click', clickOutsideDropdownMenuListener);
    }
}
/**
 * Sorts the items of an array using the given sorting function.
 */
$.fn.sortChildren = function (sortingFunction) {
    return this.each(function () {
        const $children = $(this).children().get();
        $children.sort(sortingFunction);
        $(this).append($children);
    });

};
/**
 * Returns unique elements of an array.
 */
function set(array) {
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }
    return a;
}
/**
 * Returns elements in first array not present in second array.
 */
function difference(array1, array2) {
    return array1.filter(function(x) {
        return array2.indexOf(x) < 0;
    });
}
/**
 * Returns unique elements of both arrays.
 */
function union(array1, array2) {
    return set(array1.concat(array2));
}
/**
 * Returns the string with the first letter capitalized.
 */
function capitalize(string) {
    if (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    return '';
}
/**
 * Converts a number to a roman numeral.
 */
function toRoman(number) {
    const vals = [10, 9, 5, 4, 1];
    const syms = ['X', 'IX', 'V', 'IV', 'I'];
    roman = '';
    for (let i = 0; i < syms.length; i++) {
        while (number >= vals[i]) {
            number -= vals[i];
            roman += syms[i];
        }
    }
    return roman;
}
/**
 * Handles the 'change' event on checkboxes.
 */
function changeCheckbox() {
    var $this = $(this);
    var is_radio = $this.attr('type') == 'radio';
    var name = $this.attr('name');
    var $button = $('#' + name + '-filter');
    if (is_radio) {
        // Mark all others unchecked
        $('input[name="' + name + '"]:not([value="' + $this.val() + '"])').each(function() {
            $(this).prop('checked', false).parent().removeClass('active');
        });
    }
    if (this.checked) {
        $this.parent().addClass('active');
        if ($this.val() == 'all') {
            // Select all
            $('input[name="' + name + '"]:not([value="all"])').each(function () {
                $(this).prop('checked', true).parent().addClass('active');
            });
        }
    } else {
        $this.parent().removeClass('active');
        if ($this.val() == 'all') {
            // Unselect all
            $('input[name="' + name + '"]:not([value="all"])').each(function () {
                $(this).prop('checked', false).parent().removeClass('active');
            });
        } else if (!is_radio) {
            // Mark 'Select All' as unchecked
            $('input[name="' + name + '"][value="all"]').prop('checked', false).parent().removeClass('active');
        }
    }
    // Mark 'Select All' as checked if all checked
    var options = $('input[name="' + name + '"]:not([value="all"])').length;
    var $checked = $('input[name="' + name + '"]:not([value="all"]):checked');
    if (options == $checked.length) {
        $('input[name="' + name + '"][value="all"]').prop('checked', true).parent().addClass('active');
        $button.text('All selected');
    } else {
        if ($checked.length == 0) {
            $button.text('None selected');
        } else if ($checked.length == 1) {
            $button.text($('label[for="' + $checked.attr('id') + '"]').text());
        } else {
            $button.text($checked.length + ' selected');
        }
    }
    // Do the thing
    
    filterPokemon();
    if (name == 'dex') {
        
        filterPokemon();
        // setUnobtanaiblePokemon($this.val());
        // $button.parent().removeClass('active');
    }
}
/**
 * Handles the 'click' event on the dropdown menu button.
 */
function deployDropdown() {
    var $parent = $(this).parent();
    var has_class = $parent.hasClass('active');
    $('.filter').each(function() {
        $(this).removeClass('active');
    });
    if (has_class) {
        $parent.removeClass('active');
    } else {
        $parent.addClass('active');
        document.addEventListener('click', clickOutsideDropdownMenuListener);
    }
}
/**
 * Creates a checkbox used for filtering Pokémon.
 */
function createCheckbox(type, name, value, checked=true, is_radio=false) {
    var $li = $('<li></li>')
        .attr('class', checked ? 'active' : '');
    $('<label></label>')
        .attr('for', 'filter-' + type + '-' + value)
        .text(name)
        .appendTo($li);
    $('<input />')
        .attr('id', 'filter-' + type + '-' + value)
        .attr('name', type)
        .attr('value', value)
        .prop('checked', checked)
        .attr('type', is_radio ? 'radio' : 'checkbox')
        .change(changeCheckbox)
        .appendTo($li);
    return $li;
}
/**
 * Creates a filter.
 */
function createFilter(type, name, include_select_all=true) {
    var $dropdown = $('<ol></ol>')
        .addClass('dropdown-menu');
    if (include_select_all) {
        $dropdown.append(createCheckbox(type, 'Select all', 'all'));
    }
    var $div = $('<div></div>')
        .addClass('filter');
    $('<label></gpabel>')
        .attr('for', type + '-filter')
        .text(name)
        .appendTo($div);
    $('<button></button>')
        .attr('id', type + '-filter')
        .text('All Selected')
        .click(deployDropdown)
        .appendTo($div);
    $div.append($dropdown);
    $('#filters').append($div);
    return $dropdown;
}
/**
 * Loads Pokémon data.
 */
function loadPokemon(pokemon_data, type_data) {
    var $pokedex = $('#pokedex');
    $.each(pokemon_data, function(i) {
        var type1 = pokemon_data[i].type[0];
        var type2 = pokemon_data[i].type.length == 1 ? null : pokemon_data[i].type[1];
        var immune2 = [];
        var resists = [];
        var weak2 = [];
        if (type2) {
            // Immunities are the union of each type's immunities
            immune2 = union(type_data[type1].immune2, type_data[type2].immune2);
            // Resistances are the union of the difference between each type's  resistances and weaknesses
            resists = union(
                difference(type_data[type1].resists, type_data[type2].weak2),
                difference(type_data[type2].resists, type_data[type1].weak2),
            );
            // Weaknesses are the union of the difference between each type's weaknesses and resistances
            weak2 = union(
                difference(type_data[type1].weak2, type_data[type2].resists),
                difference(type_data[type2].weak2, type_data[type1].resists),
            );
        } else {
            // If there is no secondary type, copy effectiveness from primary type
            immune2 = type_data[type1].immune2;
            resists = type_data[type1].resists;
            weak2 = type_data[type1].weak2;
        }
        var $a = $('<a></a>')
            .attr('href', '#')
            .addClass('ms')
            .text(pokemon_data[i].name);
        var version = pokemon_data[i].ver || 'sword,shield';
        var evolution = pokemon_data[i].nfe ? 'nfe' : 'fe';
        var $li = $('<li></li>')
            .attr('data-id', pokemon_data[i].id)
            .attr('data-pokemon', i)
            .attr('data-gen', pokemon_data[i].gen)
            .attr('data-type', pokemon_data[i].type)
            .attr('data-version', version)
            .attr('data-evolution', evolution)
            .attr('data-immune2', immune2)
            .attr('data-resists', resists)
            .attr('data-weak2', weak2)
            .attr('data-dex', pokemon_data[i].dex['swsh'])
            .attr('title', pokemon_data[i].name);
        if (parseInt(pokemon_data[i].dex) > 400) {
            $li.addClass('unobtainable');
        }
        $li.append($a);
        $li.click(function(e) {
            addToTeam($(this));
            e.preventDefault();
        });
        // Make Pokémon go up and down on mouse over
        var handle = 0;
        $li.hover(function() {
            var $this = $(this);
            // Change form of Cherrim, Aegislash, and Wishiwashi
            if ($this.attr('data-pokemon') == 'cherrim') {
                $this.attr('data-default', 'cherrim');
                $this.attr('data-pokemon', 'cherrim-sunshine');
            } else if ($this.attr('data-pokemon') == 'aegislash') {
                $this.attr('data-default', 'aegislash');
                $this.attr('data-pokemon', 'aegislash-blade');
            } else if ($this.attr('data-pokemon') == 'wishiwashi') {
                $this.attr('data-default', 'wishiwashi');
                $this.attr('data-pokemon', 'wishiwashi-school');
            }
            handle = setInterval(function() {
                $this.toggleClass("up");
            }, 150);
        }, function() {
            var $this = $(this);
            // Revert to original form
            if (battle_only_forms.includes($this.attr('data-pokemon'))) {
                $this.attr('data-pokemon', $this.attr('data-default'))
            }
            $this.removeClass("up");
            clearInterval(handle);
        });
        $pokedex.append($li);
    });
    $dropdown = createFilter('evolution', 'Evolution');
    $dropdown.append(createCheckbox('evolution', 'Not Fully Evolved', 'nfe'));
    $dropdown.append(createCheckbox('evolution', 'Fully Evolved', 'fe'));
    $dropdown = createFilter('version', 'Version');
    $dropdown.append(createCheckbox('version', 'Both', 'sword,shield'));
    $dropdown.append(createCheckbox('version', 'Sword', 'sword'));
    $dropdown.append(createCheckbox('version', 'Shield', 'shield'));
    // Update current team with Pokémon from URL
    if (window.location.hash) {
        // Add Pokémon to team
        window.location.hash.substring(1).split('+').forEach(function(pokemon) {
            addToTeam($('#pokedex [data-pokemon="' + pokemon + '"]'));
        });
        updateTeamHash();
    }
    // Sort Pokémon
    $('#pokedex').sortChildren((a, b) =>
        parseInt(a.getAttribute('data-dex')) - parseInt(b.getAttribute('data-dex')) ||
        parseInt(a.getAttribute('id')) - parseInt(b.getAttribute('id'))
    );
}
/**
 * Loads type data.
 */
function loadType(type_data) {
    // Create type filter
    $dropdown = createFilter('type', 'Type');
    // Populate team type analysis tables
    $.each(type_data, function(type) {
        var name = capitalize(type);
        var $tr = $('<tr></tr>')
            .attr('data-type', type);
        $tr.append($('<th data-slot="1">' + name + '</th>'));
        $tr.append($('<td>0</td>'));
        $tr.appendTo($('#team-immunities tbody'));
        $tr.clone().appendTo($('#team-resistances tbody'));
        $tr.clone().appendTo($('#team-weaknesses tbody'));
        $dropdown.append(createCheckbox('type', name, type));
    });
    // Load Pokémon
    $.getJSON('https://richi3f.github.io/pokemon-team-planner/static/pokemon.json', pokemon_data => loadPokemon(pokemon_data, type_data));
}
function filterPokemon() {
    $('#pokedex [data-pokemon]').addClass('filtered');
    // get selected generations
    var gens = []; var i = 0;
    $('#gen-filter + .dropdown-menu .active input:not([value="all"])').each(function() {
        gens[i++] = $(this).val();
    });
    var types = []; i = 0;
    $('#type-filter + .dropdown-menu .active input:not([value="all"])').each(function() {
        types[i++] = $(this).val();
    });
    var evolutions = []; i = 0;
    $('#evolution-filter + .dropdown-menu .active input:not([value="all"])').each(function() {
        evolutions[i++] = $(this).val();
    });
    var versions = []; i = 0;
    $('#version-filter + .dropdown-menu .active input:not([value="all"])').each(function() {
        versions[i++] = $(this).val();
    });
    $('#pokedex li').each(function() {
        var $this = $(this);
        var type = $this.attr('data-type').split(',');
        if (gens.includes($this.attr('data-gen')) &&
            (types.includes(type[0]) || (type[1] && types.includes(type[1]))) &&
            evolutions.includes($this.attr('data-evolution')) &&
            versions.includes($this.attr('data-version'))
        ) {
            $this.removeClass('filtered');
        } else {
            $this.addClass('filtered');
        }
    });
    console.log(versions)
}
/**
 * Adds the unobtainable class to Pokémon that cannot be caught in the current dex.
 */
function setUnobtanaiblePokemon(dex) {
    alert('d');
    $('article[data-pokedex]').attr('data-pokedex', dex);
    // Hide/Show Pokémon from Pokédex
    $('#pokedex li').each(function() {
        var $this = $(this);
        if (parseInt($this.attr('data-dex-' + dex)) > 0) {
            $this.removeClass("unobtainable");
        } else {
            $this.addClass("unobtainable");
        }
    });
    // Sort Pokédex
    $('#pokedex').sortChildren((a, b) => parseInt(a.getAttribute('data-dex-' + dex)) > parseInt(b.getAttribute('data-dex-' + dex)) ? 1 : -1);
    // Remove from team
    $('#slots [data-pokemon]:not([data-pokemon=""])').each(function() {
        var $this = $(this);
        if ($('#pokedex [data-pokemon="' + $this.attr('data-pokemon') + '"]').hasClass('unobtainable')) {
            removeFromTeam($this);
        }
    });
    updateTeamHash();
    return;

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
    var isAlolaDex = $("#alola-dex").length > 0 || $("#new-alola-dex").length > 0;
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
        var name = $this.attr("title").toLowerCase();
        var query = $("#search-bar").val().toLowerCase();
        if (name.indexOf(query) == -1) return;
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
    // hide header if there are no Pokémon to show
    $("h4 + ol.picker").each(function() {
        var $this = $(this);
        var children = $this.children("li").length;
        var filteredChildren = $this.children("li.filtered").length;
        if (children == filteredChildren) {
            $this.prev().addClass("hidden");
        } else {
            $this.prev().removeClass("hidden");
        }
    });
}
/**
 * Returns a random number.
 */
function getRandomNumber(upperBound) {
    return Math.floor((Math.random() * upperBound) + 1);
}
/**
 * Returns unique elements of an array.
 */
function randomizeTeam(e) {
    e.preventDefault();
    // Clear current team
    $('#slots [data-pokemon]').each(function() {
        removeFromTeam($(this));
    });
    var $filteredPkmn = $('#pokedex [data-pokemon]:not(.unobtainable):not(.filtered):not(.picked)');
    if ($filteredPkmn.length > 0)
    {
        var teamSize = 6;
        // If there are less than 6 available Pokémon, use that number
        if ($filteredPkmn.length < teamSize)
        {
            teamSize = $filteredPkmn.length;
        }
        for (let i = 0; i < teamSize; i++)
        {
            var randomNumber = getRandomNumber($filteredPkmn.length) - 1;
            addToTeam($filteredPkmn.eq(randomNumber));
            $filteredPkmn = $('#pokedex [data-pokemon]:not(.unobtainable):not(.filtered):not(.picked)');
        }
    }
}
/**
 * Adds a Pokémon to the team.
 */
function addToTeam($this) {
    var pokemon = $this.attr('data-pokemon');
    if (!pokemon || $this.hasClass('unobtainable')) {
        return;
    } else if (battle_only_forms.includes(pokemon)) {
        pokemon = $this.attr('data-default');
    }
    var name = $this.attr('title')
    // Find first empty slot
    var $slot = $('#slots [data-pokemon=""]').first();
    // If there is no empty slot, remove Pokemon on first slot
    if ($slot.length <= 0) {
        removeFromTeam($('#slots [data-pokemon]').first())
        $slot = $('#slots [data-pokemon=""]').first();
    }
    // Transfer data to slot
    var type = $this.attr('data-type').split(',');
    var type1 = capitalize(type[0]);
    var type2 = capitalize(type.length == 1 ? null : type[1]);
    $slot.attr('data-pokemon', pokemon);
    $slot.attr('data-type', type);
    $slot.attr('data-gen', $this.attr('data-gen'));
    $slot.find('figure').attr('title', name);
    var $info = $slot.find('.info');
    $info.find('.name').text(name);
    $info.find('.type[data-slot="1"]')
        .attr('title', type1)
        .text(type1);
    $info.find('.type[data-slot="2"]')
        .attr('title', type2)
        .text(type2);
    // Hide picked Pokémon
    $this.addClass('picked');
    // Update stuff
    updateTeamTypeAnalysis(pokemon);
    updateTeamHash();
}
/**
 * Removes a Pokémon from the team.
 */
function removeFromTeam($this) {
    var pokemon = $this.attr('data-pokemon');
    if (!pokemon) {
        return;
    }
    // Make Pokémon visible again
    $('#pokedex [data-pokemon="' + pokemon +  '"]').removeClass("picked");
    // Reset slot
    $this.attr('data-pokemon', '');
    $this.attr('data-type', '');
    $this.attr('data-gen', '');
    $this.find('figure').attr('title', '');
    var $info = $this.find('.info');
    $info.find('.name').text('???');
    $info.find('.type[data-slot="1"]')
        .attr('title', '')
        .text('');
    $info.find('.type[data-slot="2"]')
        .attr('title', '')
        .text('');
    // Send slot to last place
    $("#slots").append($this);
    // Update stuff
    updateTeamTypeAnalysis(pokemon, true);
    updateTeamHash();
}
/**
 * Updates the team's type analysis.
 */
function updateTeamTypeAnalysis(pokemon, remove) {
    if (remove === undefined) {
        remove = false;
    }
    var $pokemon = $('#pokedex [data-pokemon="' + pokemon + '"]');
    if ($pokemon.length < 1) {
        $pokemon = $('#pokedex [data-default="' + pokemon + '"]');
    }
    $pokemon.attr('data-weak2').split(',').forEach(
        type => updateTeamTypeAnalysisTable(type, remove, '#team-weaknesses', 'Weak')
    );
    $pokemon.attr('data-immune2').split(',').forEach(
        type => updateTeamTypeAnalysisTable(type, remove, '#team-immunities', 'Immune')
    );
    $pokemon.attr('data-resists').split(',').forEach(
        type => updateTeamTypeAnalysisTable(type, remove, '#team-resistances', 'Resistant')
    );
}
/**
 * Updates the team's type analysis table.
 */
function updateTeamTypeAnalysisTable(type, remove, table_id, adjective) {
    var $tr = $(table_id + ' [data-type="' + type + '"]');
    // Get update current number of Pokémon
    var $td = $tr.find('td');
    var num = parseInt($td.text());
    num += remove ? -1 : 1;
    $td.text(num);
    // Update text
    var verb = (num == 1) ? 'Is' : 'Are';
    $tr.attr('title', num + ' Pokémon ' + verb + ' ' + adjective + ' to the ' + capitalize(type) + ' Type!');
}
/**
 * Updates the team's URL.
 */
function updateTeamHash() {
    var hashArray = [];
    $('#slots li:not([data-pokemon=""])').each(function() {
        hashArray.push($(this).attr('data-pokemon'));
    });
    window.location.hash = hashArray.join('+');
    $("#copy-url input").val(document.URL);
}
$(document).ready(function(){
    // Create team slots
    var $team = $('#team #slots');
    var $slot = $team.find('li');
    $slot.click(function(e) {
        removeFromTeam($(this));
        e.preventDefault();
    });
    for (let i = 0; i < 5; i++) {
        $slot.clone(true).appendTo($team);
    }
    // Create filters
    $dropdown = createFilter('gen', 'Generation');
    for (let i = 1; i <= 8; i++) {
        $dropdown.append(createCheckbox('gen', 'Generation ' + toRoman(i), i));
    }
    // Load types and Pokémon
    $.getJSON('https://richi3f.github.io/pokemon-team-planner/static/types.json', loadType);
    $('#randomize').click(randomizeTeam);
    // Show/hide team's weaknesses
    $('#type-analysis .button').click(function(e) {
        e.preventDefault();
        $('#type-analysis .button').toggleClass('hidden');
        $(this).siblings('table').each(function() {
            $(this).toggleClass('hidden');
        });
    });
    // Set current URL
    $('#copy-url input').val(document.URL);
});
// Copy feature
var clipboard = new ClipboardJS('#copy-url a');
clipboard.on('success', function() {
    var $button = $("#copy-url a");
    $button.text("Copied!");
    setTimeout(function() {
        $button.text("Copy");
    }, 3000);
});
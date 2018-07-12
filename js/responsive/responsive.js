'use strict';

// Wait for the complete page loading
$(document).ready(function() {

    $(window).on('load resize', function() {
        if ($(window).width() < 977) {
            $('#character_sheet').append($('#start_game_container'));
            $('#character_sheet').append($('#fight_buttons_container'))
        } else {
            $('#content').prepend($('#fight_buttons_container'));
            $('#content').prepend($('#start_game_container'));

            $('#board_game').prepend($('#rules'));
        }
    });

    $(window).on('resize', function() {
        const $rulesContainer = $('#rules');

        if ($(window).width() < 480) {
            $rulesContainer.addClass('responsive-rules');
            $('#content').prepend($rulesContainer);
        } else {
            $rulesContainer.removeClass('responsive-rules');
            $('#board_game').prepend($rulesContainer);
        }
    });
});

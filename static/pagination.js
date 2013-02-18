// this code is an awful example of writing good javascript
$(document).ready( function () {
    // define a user model and give it some simple method
    var User = Backbone.Model.extend({
        fullInfo: function () {
            return this.get('name') + " /// " + this.get('age');
        },
    });

    // define a collection over a user
    var Users = Backbone.Collection.extend({
        model: User,

        getBaseUrl: function () { return '/users'; },

        // intialize with an empty cursor and a base url. then fetch
        initialize: function () {
            this._meta = {'cursor' : '' }; // pointer to next page
            this.url = this.getBaseUrl();
            this.fetch();
        },

        getCursor: function () { return this._meta['cursor'] },
        setCursor: function (c) { this._meta['cursor'] = c; return this },
        hasCursor: function () { return this.getCursor() !== '' },

        // add cursor to url if there is a cursor
        appendCursorToUrl: function (url) {
            if(this.hasCursor()) {
                return url + "/" + this.getCursor();
            }
            return url;
        },

        // load the next page of users with the cursor object this collection
        // contains
        nextPage: function () {
            this.url = this.appendCursorToUrl(this.getBaseUrl());
            console.log("fetching with url: " + this.url);
            this.fetch();
        },

        // read a cursor + a collection of users from the raw response
        parse: function (response) {
            console.log("obtained cursor: " + response.cursor);
            this.setCursor(response.cursor);
            return _(response.users).map(function (u) {
                return new User(u);
            });
        },
    });

    var UsersView = Backbone.View.extend({
        el : $('#users'),  // dom element displaying users
        events: { 'click button#next' : 'nextPage' },
        initialize: function() { 
            // make this refer to UsersView in the methods below. Might not
            // be necessary anymore
            _.bindAll(this, 'appendUser', 'render', 'nextPage');
            this.collection = new Users();
            this.collection.bind('next', this.nextPage);
            // TODO : shit doesn't work without this. figure out why
            this.collection.bind('reset', _.bind(this.render, this));
        },
        render: function() {
            html = "<ul></ul>"
            // cursor is not always present so we must render the button
            // conditionally
            if (this.collection.hasCursor())
                html += "<button id='next'>Next page</button>";
            $(this.el).html(html);

            var self = this;
            _(this.collection.models).each(function (user) {
                self.appendUser(user);
            }, this);
        },

        appendUser: function(user){
            $('ul', this.el).append("<li>" + user.fullInfo() + "</li>");
        },
        nextPage: function() { this.collection.nextPage(); }
    });
    usersView = new UsersView();
});

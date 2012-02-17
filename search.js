//   ConnectionManager 3 - Simple GUI app for Gnome 3 that provides a menu 
//   for initiating SSH/Telnet/Custom Apps connections. 
//   Copyright (C) 2011  Stefano Ciancio
//
//   This library is free software; you can redistribute it and/or
//   modify it under the terms of the GNU Library General Public
//   License as published by the Free Software Foundation; either
//   version 2 of the License, or (at your option) any later version.
//
//   This library is distributed in the hope that it will be useful,
//   but WITHOUT ANY WARRANTY; without even the implied warranty of
//   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
//   Library General Public License for more details.
//
//   You should have received a copy of the GNU Library General Public
//   License along with this library; if not, write to the Free Software
//   Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA

const Shell = imports.gi.Shell;
const Search = imports.ui.search;
const Util = imports.misc.util;


// SSH / Apps Search Provider
function SshSearchProvider() {
	this._init();
}

SshSearchProvider.prototype = {
	__proto__: Search.SearchProvider.prototype,

	_init: function() {
		Search.SearchProvider.prototype._init.call(this, "CONNECTION MANAGER");
		this.sshNames = [];
	},
	
	// Update list of SSH/Apps on configuration changes
	_update: function (sshNames) {
		this.sshNames = sshNames;
	},

	getResultMeta: function(resultId) {
	
		let appSys = Shell.AppSystem.get_default();
		let app = appSys.lookup_app('gnome-session-properties.desktop');

		switch (resultId.type) {
		case '__app__':
			app = appSys.lookup_app('gnome-session-properties.desktop');
			break;
		case '__item__':
			app = appSys.lookup_app(resultId.terminal + '.desktop');
			break;
		}

		let ssh_name = resultId.name;

		return {'id': resultId,
				'name': ssh_name,
				'createIcon': function(size) {
								return app.create_icon_texture(size);
							  }
		};
	},

	activateResult: function(id) {
		Util.spawnCommandLine(id.command);
	},
	
	getInitialResultSet: function(terms) {
		// check if a found host-name begins like the search-term
		let searchResults = [];

		for (var i=0; i<this.sshNames.length; i++) {
			for (var j=0; j<terms.length; j++) {
				try {
					let pattern = new RegExp(terms[j],"gi");
					if (this.sshNames[i][2].match(pattern)) {

						searchResults.push({
								'type': this.sshNames[i][0],
								'terminal': this.sshNames[i][1],
								'name': this.sshNames[i][2],
								'command': this.sshNames[i][3]
						});
					}
				}
				catch(ex) {
					continue;
				}
			}
		}

		if (searchResults.length > 0) {
			return(searchResults);
		}

		return []
	},

	getSubsearchResultSet: function(previousResults, terms) {
		return this.getInitialResultSet(terms);
	},

}

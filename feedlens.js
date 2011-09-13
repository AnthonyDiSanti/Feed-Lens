function FeedLens() {
	    var thatFeedLens = this;
	        
	        var _isLoggedIn = false;
		    
		    var _settings = {
			            bindings: {}
					          };
		        
		        var _user = {
				        friends: {},
						         friendlists: {},
							         photos: {}
						     };
			    
			    var _photos = {};
			        
			        this.init = function() {
					        FB.Event.subscribe('auth.login', _loginStatusHandler);
						        FB.Event.subscribe('auth.logout', _loginStatusHandler);
							        
							        FB.getLoginStatus(_loginStatusHandler);
								    };
				    
				    function _loginStatusHandler(response) {
					            if (typeof response !== 'object') {
							                return false;
									        }
						            
						            if (typeof response.authResponse === 'object') {
								                _userLogIn();
										        } else {
												            _userLogOut();
													            }
							        }
				        ;
					    
					    function _userLogIn() {
						            if (!_isLoggedIn) {
								                _isLoggedIn = true;
										            _loadUserAttribute('friendlists');
											                _loadUserAttribute('friends');
													        }
							        }
					        
					        function _userLogOut() {
							        _isLoggedIn = false;
								    }
						    
						    this.bindFriends = function(bindTarget) {
							            return _bindUserAttribute('friends', bindTarget);
								        };
						        
						        this.bindFriendlists = function(bindTarget) {
								        return _bindUserAttribute('friendlists', bindTarget);
									    };
							    
							    this.bindStream = function(bindTarget) {
								            if (typeof bindTarget === 'string') {
										                bindTarget = document.getElementById(bindTarget);
												        }
									            
									            if (!(fxcm.lib.isDOMElement(bindTarget))) {
											                return false;
													        }
										            
										            return _settings.bindings.stream = bindTarget;
											        };
							        
							        this.clearStream = function() {
									        if (typeof _settings.bindings.stream === 'undefined') {
											            return false;
												            }
										        
										        $(_settings.bindings.stream).children().remove();
											    };
								    
								    function _bindUserAttribute(attribute, bindTarget) {
									            if (typeof bindTarget === 'string') {
											                bindTarget = document.getElementById(bindTarget);
													        }
										            
										            if (!(fxcm.lib.isDOMElement(bindTarget))) {
												                return false;
														        }
											            
											            _settings.bindings[attribute] = bindTarget;
												            _loadUserAttribute(attribute);
													            
													            return bindTarget;
														        }
								        
								        function _loadUserAttribute(attribute) {
										        if (!(_isLoggedIn && typeof _settings.bindings[attribute] === 'object')) {
												            return false;
													            }
											        
											        FB.api('/me/' + attribute, function(response) {
														            return _setUserAttribute(attribute, response);
															            });
												        
												        return true;
													    }
									    
									    function _setUserAttribute(attribute, response) {
										            _user[attribute] = {};
											            
											            for (var dataIndex = 0; dataIndex < response.data.length; dataIndex++) {
													                var dataPoint = response.data[dataIndex];
															            
															            _user[attribute][dataPoint.id] = {name: dataPoint.name};
																            }
												            
												            if (attribute === 'friendlists') {
														                return _renderFriendlists();
																        }
													            
													            return true;
														        }
									        
									        function _renderFriendlists() {
											        var container = document.createElement('ul');
												        
												        for (var friendlistID in _user.friendlists) {
														            var friendlistLI = document.createElement('li');
															                var friendlistLink = document.createElement('a');
																	            friendlistLink.innerHTML = _user.friendlists[friendlistID].name;
																		                friendlistLink.id = friendlistID;
																				            friendlistLink.href = 'javascript:void(0);';
																					                $(friendlistLink).click(_friendlistClickHandler);
																							            friendlistLI.appendChild(friendlistLink);
																								                container.appendChild(friendlistLI);
																										        }
													        
													        _settings.bindings.friendlists.appendChild(container);
														    }
										    
										    function _friendlistClickHandler(event) {
											            $(_settings.bindings.friendlists).find('ul>li>a.selected').removeClass('selected');
												            $(this).addClass('selected');
													            thatFeedLens.clearStream();
														            var friendlistID = this.id;
															            FB.api('/' + friendlistID + '/members', function(response) {
																		                _loadFriendList(friendlistID, response.data);
																				        });
																        }
										        
										        function _loadFriendList(friendlistID, listMembers) {
												        if (typeof _user.friendlists[friendlistID] !== 'object') {
														            _user.friendlists[friendlistID] = {};
															            }
													        
													        for (var memberIndex = 0; memberIndex < listMembers.length; memberIndex++) {
															            var friend = listMembers[memberIndex];
																                if (typeof _user.friends[friend.id] !== 'object') {
																			                _user.friends[friend.id] = {};
																					            }
																		            _user.friends[friend.id].name = friend.name;
																			                
																			                _user.friendlists[friendlistID][friend.id] = _user.friends[friend.id];
																					        }
														        
														        _loadFriends(_user.friendlists[friendlistID]);
															        _loadPhotos(_user.friendlists[friendlistID]);
																    }
											    
											    function _loadFriends(friends) {
												            $(_settings.bindings.friends).children().remove();
													            var container = document.createElement('ul');
														            
														            for (var friendID in friends) {
																                if (typeof _user.friends[friendID] === 'object') {
																			                var friendLI = document.createElement('li');
																					                var friendLink = document.createElement('a');
																							                friendLink.innerHTML = _user.friends[friendID].name;
																									                friendLink.id = friendID;
																											                friendLink.href = 'javascript:void(0);';
																													                $(friendLink).click(_friendClickHandler);
																															                friendLI.appendChild(friendLink);
																																	                container.appendChild(friendLI);
																																			            }
																		        }
															            
															            _settings.bindings.friends.appendChild(container);
																        }
											        
											        function _friendClickHandler(event) {
													        $(_settings.bindings.friends).find('ul>li>a.selected').removeClass('selected');
														        $(this).addClass('selected');
															        thatFeedLens.clearStream();
																        _renderPhotos(_user.friends[this.id].photos);
																	    }
												    
												    function _loadPhotos(users) {
													            if (typeof users !== 'object') {
															                var paramID = users;
																	            users = {};
																		                users[paramID] = {};
																				        }
														            
														            for (var userID in users) {
																                if (typeof users[userID] === 'object' && typeof users[userID].photos !== 'object') {
																			                FB.api(userID + '/photos', function() {
																							                    var callbackUserID = userID;
																									                        return function(response) {
																												                        return _setPhotos(callbackUserID, response);
																															                    };
																																	                    }());
																					            } else {
																							                    _renderPhotos(users[userID].photos);
																									                }
																		        }
															        }
												        
												        function _setPhotos(userID, response) {
														        _user.friends[userID].photos = {};
															        var userReferences = _user.friends[userID].photos;
																        
																        var photoCache = _user.friends[userID].photos;
																	        var photos = response.data;
																		        for (var photoIndex = 0; photoIndex < photos.length; photoIndex++) {
																				            var photo = photos[photoIndex];
																					                photoCache[photo.id] = photo;
																							            userReferences[photo.id] = photo;
																								            }
																			        
																			        _renderPhotos(userReferences);
																				    }
													    
													    function _renderPhotos(photos) {
														            for (var photoID in photos) {
																                var image = document.createElement('img');
																		            image.src = photos[photoID].source;
																			                _settings.bindings.stream.appendChild(image);
																					        }
															        }
}

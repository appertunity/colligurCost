angular.module('your_app_name.auth.controllers', [])

.controller('AuthCtrl', function($scope){

})



.controller('WelcomeCtrl', function($scope,AuthService, $localStorage,$ionicModal,$ionicActionSheet,$timeout,BuySellService,BookService,Universcities, show_hidden_actions, $state, $ionicPopup, $ionicLoading){
	$scope.categories = [];
	$scope.book_categories = [];
	$scope.universities = [];
	$scope.input = {};
	$scope.data = {};
	$scope.$storage = localStorage;
	$scope.fbresp="";
	$scope.googleresp="";

	if($scope.$storage.u_id && $state.current.name == 'auth.welcome'){
		$state.go('auth.home');
	}
	$scope.logingoogleplus=function () {
		window.plugins.googleplus.login(
			{},
			function (user_data) {
				$scope.data.name = user_data.displayName
				$scope.data.email = user_data.email
				$scope.data.google = user_data.userId
				AuthService.postUser($scope.data).then(function(de){
					$scope.$storage.u_id = de.id
					$state.go('auth.home');
				});		//
				//Properties of user_data
					/*userID: user_data.userId,
					name: user_data.displayName,
					email: user_data.email,
					picture: user_data.imageUrl,
					accessToken: user_data.accessToken,
					idToken: user_data.idToken*/

				//go to another state after successfully login from here
				/*$state.go('anystatename');*/
			},
			function (msg) {}
		);
	}
	$scope.loginfacebook=function () {
		CordovaFacebook.login({
			permissions: ['email'],
			onSuccess: function(result) {
				if(result.declined.length > 0) {
					alert("The User declined something!");
				} else {
					AuthService.Auth('fb',result.userID).then(function(de){
						if(de.id){
							$scope.$storage.u_id =  de.id
						}
					});
					$state.go('auth.home');
					CordovaFacebook.graphRequest({
						path: '/me',
						params: { fields: 'email,id,first_name,last_name,gender,link,name' },
						onSuccess: function (userData) {
							$scope.data.name = userData.first_name + " " + userData.last_name
							$scope.data.email = userData.email
							$scope.data.facebook = userData.id
							AuthService.postUser($scope.data).then(function(de){
								$scope.$storage.u_id =  de.id
								$state.go('auth.home');
							})
						},
						onFailure: function (result) {
							if (result.error) {
								Error.log('error', 'There was an error in graph request:' + result.errorLocalized);
							}
						}
					});

				}
				/* ... */
			},
			onFailure: function(result) {
				if(result.cancelled) {
					alert("The user doesn't like my app");
				} else if(result.error) {
					alert("There was an error:" + result.errorLocalized);
				}
			}
		});




	}

	

	$scope.modules = {
		"type": "select",
		"name": "Service",
		"value": "BUY AND SELL",
		"values": [ "BUY AND SELL", "BOOK" ]
	};


	BuySellService.BuySellCategories().then(function(data){
		$scope.categories = data

	})

	BookService.getCategories().then(function(data){
		$scope.book_categories = data
	})

	Universcities.getUniverscities().then(function(data){
		$scope.universities = data

	})

	$scope.show_hidden_actions = show_hidden_actions;

	$scope.toggleHiddenActions = function(){
		$scope.show_hidden_actions = !$scope.show_hidden_actions;
	};

	$scope.showPopup = function(product) {
		$scope.data = {};
		$scope.product = product;
		$scope.uniPopup = $ionicPopup.show({
			cssClass: 'add-to-cart-popup',
			templateUrl: 'views/app/partials/universities-popup.html',
			title: 'Universities',
			scope: $scope,
			buttons: [
				{text: ' Back', type: 'close-popup ion-arrow-left-a'},
				/*{
					text: 'Add to cart',
					onTap: function (e) {
				 return $scope.data;
					}
				}*/
			]
		});
		$scope.uniPopup.then(function (res) {
			if (res) {
				$ionicLoading.show({
					template: '<ion-spinner icon="ios"></ion-spinner><p style="margin: 5px 0 0 0;">Adding to cart</p>',
					duration: 1000
				});
				ShopService.addProductToCart(res.product);
				console.log('Item added to cart!', res);
			}
			else {
				console.log('Popup closed');
			}
		});
	}

	$scope.SetUni = function ($id,$text) {
		$scope.$storage.uni_id = $id;
		$scope.$storage.uni_text = $text
		$scope.uniPopup.close()
	}
	/*Categories*/
	$scope.showCategories = function(product) {
		$scope.data = {};
		$scope.product = product;
		var myPopup = $ionicPopup.show({
			cssClass: 'add-to-cart-popup popup-vertical-buttons',
			templateUrl: 'views/app//partials/browse-category-popup.html',
			title: 'BROWSE CATEGORIES',
			scope: $scope,
			buttons: [
				{text: ' Back', type: 'close-popup ion-arrow-left-a'},
				{
				 text: 'BUY AND SELL',
				 type: "FBlue",
				 onTap: function (e) {
					 $scope.showBuySellCategories();
					 return $scope.data;
				 }
				},
				{
					text: 'BOOKS',
					type:"FBlue",
					onTap: function (e) {
                        $scope.showBookCategories();
						return $scope.data;
					}
				}
			]
		});
		myPopup.then(function (res) {
			if (res) {
				/*$ionicLoading.show({
					template: '<ion-spinner icon="ios"></ion-spinner><p style="margin: 5px 0 0 0;">Browsing Categories</p>',
					duration: 1000
				});*/

				console.log('Item added to cart!', res);
			}
			else {
				console.log('Popup closed');
			}
		});
	}

	$scope.showBuySellCategories = function(product) {
		$scope.data = {};
		$scope.BuyAndSellPopup = $ionicPopup.show({
			cssClass: 'add-to-cart-popup',
			templateUrl: 'views/app/partials/buysell-categories.html',
			title: 'BUYSELL',
			scope: $scope,
			buttons: [
				{text: ' Back', type: 'close-popup ion-arrow-left-a'},
			]
		});
		$scope.BuyAndSellPopup.then(function (res) {
			if (res) {
				$ionicLoading.show({
					template: '<ion-spinner icon="ios"></ion-spinner><p style="margin: 5px 0 0 0;">Adding to cart</p>',
					duration: 1000
				});
				console.log('Item added to cart!', res);
			}
			else {
				console.log('Popup closed');
			}
		});
	}

	$scope.BuySellClicked =function(id,text){

		$scope.$storage.BuySellCatId = id
		$scope.$storage.BuySellCatText = text

		$state.transitionTo('app.shop.buysell');
		$scope.BuyAndSellPopup.close()
	}

	$scope.showBookCategories = function(product) {
		$scope.data = {};
		$scope.BookPopup = $ionicPopup.show({
			cssClass: 'add-to-cart-popup',
			title: 'BOOK',
			templateUrl: 'views/app/partials/book-categories.html',

			scope: $scope,
			buttons: [
				{text: ' Back', type: 'close-popup ion-arrow-left-a'},
			]
		});
		$scope.BookPopup.then(function (res) {
			if (res) {
				$ionicLoading.show({
					template: '<ion-spinner icon="ios"></ion-spinner><p style="margin: 5px 0 0 0;">Browing Book Categories</p>',
					duration: 1000
				});
				console.log('Item added to cart!', res);
			}
			else {
				console.log('Popup closed');
			}
		});
	}

	$scope.BookClicked =function(id,text){
		$scope.$storage.BookCatId = id
		$scope.$storage.BookCatText = text
		$state.go('app.shop.book');

		$scope.BookPopup.close()
	}

	/*Posting Butoton*/
	$scope.showPosting = function() {
		$scope.data = {};
		var myPopup = $ionicPopup.show({
			cssClass: 'add-to-cart-popup',
			templateUrl: 'views/app//partials/browse-category-popup.html',
			title: 'PLACE AN AD',
			scope: $scope,
			buttons: [
				{text: ' Back', type: 'close-popup ion-arrow-left-a'},
				{
					text: 'BUY AND SELL',
					onTap: function (e) {
						$state.go('app.buysell-add');
						return $scope.data;
					}
				},
				{
					text: 'BOOKS',
					onTap: function (e) {
						$state.go('app.book-add')
						return $scope.data;
					}
				}
			]
		});
		myPopup.then(function (res) {
			if (res) {
				/*$ionicLoading.show({
					template: '<ion-spinner icon="ios"></ion-spinner><p style="margin: 5px 0 0 0;">Browsing Buy And Sell Categories</p>',
					duration: 1000
				});*/

				console.log('Item added to cart!', res);
			}
			else {
				console.log('Popup closed');
			}
		});
	}
	
	$scope.HitSearch =function () {

		if($scope.modules.value == 'BUY AND SELL'){
			$state.go('app.shop.buysell',{keyword:$scope.input.searchTXT})
		} else if($scope.modules.value == 'BOOK'){
			$state.go('app.shop.book',{keyword:$scope.input.searchTXT})
		}

		$scope.filter.hide();
	}


	$ionicModal.fromTemplateUrl('views/app/buysell/filter.html',function(modal) {
		$scope.modal = modal;  /// HERE YOU ARE TELLING THE MODAL TO USE THE SAME SCOPE ALL THE CONTROLLER
	} ,{
		scope: $scope,
		animation: 'slide-in-up',

	  }).then(function(modal) {
		$scope.filter = modal;
	  });

	$scope.openFilter= function() {

		$scope.filter.show();
	};


	$scope.showTerms = function() {
		$scope.terms_of_service_modal.show();
	  };
	
	$scope.getItem = function ($id) {

	}
})

.controller('LogInCtrl', function($scope, $state ){
	$scope.doLogIn = function(){
		console.log("doing log in");
		$state.go('app.feed');
	};
})

.controller('SignUpCtrl', function($scope, $state){
	$scope.doSignUp = function(){
		console.log("doing sign up");
		$state.go('app.feed');
	};
})

.controller('ForgotPasswordCtrl', function($scope, $state){
	$scope.requestNewPassword = function() {
    console.log("requesting new password");
		$state.go('app.feed');
  };
})

;

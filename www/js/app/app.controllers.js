angular.module('your_app_name.app.controllers', [])


.controller('AppCtrl', function($scope, AuthService) {

  //this will represent our logged user
  var user = {
    about: "Design Lead of Project Fi. Love adventures, green tea, and the color pink.",
    name: "Brynn Evans",
    picture: "https://s3.amazonaws.com/uifaces/faces/twitter/brynn/128.jpg",
    _id: 0,
    followers: 345,
    following: 58
  };

  //save our logged user on the localStorage
  $scope.loggedUser = user;
})


.controller('ProfileCtrl', function($scope, $stateParams, PostService, $ionicHistory, $state, $ionicScrollDelegate) {

  $scope.$on('$ionicView.afterEnter', function() {
    $ionicScrollDelegate.$getByHandle('profile-scroll').resize();
  });

  var userId = $stateParams.userId;

  $scope.myProfile = $scope.loggedUser._id == userId;
  $scope.posts = [];
  $scope.likes = [];
  $scope.user = {};

  PostService.getUserPosts(userId).then(function(data){
    $scope.posts = data;
  });

  PostService.getUserDetails(userId).then(function(data){
    $scope.user = data;
  });

  PostService.getUserLikes(userId).then(function(data){
    $scope.likes = data;
  });

  $scope.getUserLikes = function(userId){
    //we need to do this in order to prevent the back to change
    $ionicHistory.currentView($ionicHistory.backView());
    $ionicHistory.nextViewOptions({ disableAnimate: true });

    $state.go('app.profile.likes', {userId: userId});
  };

  $scope.getUserPosts = function(userId){
    //we need to do this in order to prevent the back to change
    $ionicHistory.currentView($ionicHistory.backView());
    $ionicHistory.nextViewOptions({ disableAnimate: true });

    $state.go('app.profile.posts', {userId: userId});
  };

})


.controller('ProductCtrl', function($scope, $stateParams, ShopService, $ionicPopup, $ionicLoading) {
  var productId = $stateParams.productId;

  ShopService.getProduct(productId).then(function(product){
    $scope.product = product;
  });

  // show add to cart popup on button click
  $scope.showAddToCartPopup = function(product) {
    $scope.data = {};
    $scope.data.product = product;
    $scope.data.productOption = 1;
    $scope.data.productQuantity = 1;

    var myPopup = $ionicPopup.show({
      cssClass: 'add-to-cart-popup',
      templateUrl: 'views/app/shop/partials/add-to-cart-popup.html',
      title: 'Add to Cart',
      scope: $scope,
      buttons: [
        { text: '', type: 'close-popup ion-ios-close-outline' },
        {
          text: 'Add to cart',
          onTap: function(e) {
            return $scope.data;
          }
        }
      ]
    });
    myPopup.then(function(res) {
      if(res)
      {
        $ionicLoading.show({ template: '<ion-spinner icon="ios"></ion-spinner><p style="margin: 5px 0 0 0;">Adding to cart</p>', duration: 1000 });
        ShopService.addProductToCart(res.product);
        console.log('Item added to cart!', res);
      }
      else {
        console.log('Popup closed');
      }
    });
  };
})


.controller('PostCardCtrl', function($scope, PostService,$ionicPopup, $state ) {
  var commentsPopup = {};

  $scope.navigateToUserProfile = function(user){
    commentsPopup.close();
    $state.go('app.profile.posts', {userId: user._id});
  };

  $scope.showComments = function(post) {
    PostService.getPostComments(post)
    .then(function(data){
      post.comments_list = data;
      commentsPopup = $ionicPopup.show({
  			cssClass: 'popup-outer comments-view',
  			templateUrl: 'views/app/partials/comments.html',
  			scope: angular.extend($scope, {current_post: post}),
  			title: post.comments+' Comments',
  			buttons: [
  				{ text: '', type: 'close-popup ion-ios-close-outline' }
  			]
  		});
    });
	};
})

.controller('FeedCtrl', function($scope, PostService, $ionicPopup, $state) {
  $scope.posts = [];
  $scope.page = 1;
  $scope.totalPages = 1;
  $scope.doRefresh = function() {
    PostService.getFeed(1)
    .then(function(data){
      $scope.totalPages = data.totalPages;
      $scope.posts = data.posts;

      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $scope.getNewData = function() {
    //do something to load your new data here
    $scope.$broadcast('scroll.refreshComplete');
  };
  $scope.loadMoreData = function(){
    $scope.page += 1;
    PostService.getFeed($scope.page)
    .then(function(data){
      //We will update this value in every request because new posts can be created
      $scope.totalPages = data.totalPages;
      $scope.posts = $scope.posts.concat(data.posts);

      $scope.$broadcast('scroll.infiniteScrollComplete');
    });
  };

  $scope.moreDataCanBeLoaded = function(){
    return $scope.totalPages > $scope.page;
  };

  $scope.doRefresh();

})

//BuySellCtrl

.controller('BuySellCtrl', function($scope,$localStorage,$ionicPopup ,$ionicModal,$timeout,BuySellService, $stateParams,$state  ) {
  $scope.keyword = $stateParams.keyword
  $scope.products = [];
  $scope.products_count = [];
  $scope.input = [];
  $scope.page = 0
  $scope.total_records = 0
  $scope.$storage = localStorage
  $scope.loadMoreAck = true



  BuySellService.BuySellCategories().then(function(data){
        $scope.categories = data

    })
  $scope.$on('$ionicView.enter', function(){
   $scope.catText = $scope.$storage.BuySellCatText
    BuySellService.getBuySell($scope.page,$scope.$storage.BuySellCatId,$scope.keyword).then(function(data){
      $scope.products  = data
      console.log($scope.products)
    });

    BuySellService.totalRecords($scope.$storage.BuySellCatId,$scope.keyword).then(function(de){
      $scope.total_records = de
    });
  });


    
    

  $scope.loadMore = function() {
       $scope.page  =  $scope.page  + 1
       BuySellService.getBuySell($scope.page,$scope.$storage.BuySellCatId).then(function(data){
         angular.forEach(data, function(value, key) {
           $scope.products.push(value)
         })
         $timeout(function(){
           if($scope.total_records < $scope.products.length + 12 ) {
             $scope.loadMoreAck = false
           }
         },800)

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
        BuySellService.getBuySell($scope.page,$scope.$storage.BuySellCatId,$scope.keyword).then(function(data){
              $scope.products  = data
              console.log($scope.products)
        });

        BuySellService.totalRecords($scope.$storage.BuySellCatId,$scope.keyword).then(function(de){
              $scope.total_records = de
        });

        $scope.catText = $scope.$storage.BuySellCatText

        $scope.BuyAndSellPopup.close()
    }
    $scope.HitSearch =function () {
        $state.go('app.shop.buysell',{keyword:$scope.input.searchTXT})
        $scope.filter.hide();
    }


    $scope.input.searchTXT = $scope.keyword

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



    /* ShopService.getProducts().then(function(products){
        $scope.popular_products = products.slice(0, 2);
     });*/
})

.controller('BuySellAddCtrl', function($scope, $stateParams,BuySellService, $ionicPopup, $ionicLoading, $cordovaCamera, $cordovaFile, $cordovaFileTransfer, $cordovaDevice,$cordovaActionSheet) {
      $scope.formData = {};
      $scope.PriceVisible = true
      $scope.Catgories = [];
      $scope.image = null;

      BuySellService.BuySellCategories().then(function (categories) {
        $scope.Catgories = categories
      })

      $scope.showAlert = function(title, msg) {
        var alertPopup = $ionicPopup.alert({
          title: title,
          template: msg
        });
      };

      $scope.selectPicture = function(sourceType) {
        var options = {
          quality: 100,
          destinationType: Camera.DestinationType.FILE_URI,
          sourceType: sourceType,
          saveToPhotoAlbum: false
        };

        $cordovaCamera.getPicture(options).then(function(imagePath) {
              // Grab the file name of the photo in the temporary directory
              var currentName = imagePath.replace(/^.*[\\\/]/, '');

              //Create a new name for the photo
              var d = new Date(),
                  n = d.getTime(),
                  newFileName =  n + ".jpg";

              // If you are trying to load image from the gallery on Android we need special treatment!
              if ($cordovaDevice.getPlatform() == 'Android' && sourceType === Camera.PictureSourceType.PHOTOLIBRARY) {
                window.FilePath.resolveNativePath(imagePath, function(entry) {
                      window.resolveLocalFileSystemURL(entry, success, fail);
                      function fail(e) {
                        console.error('Error: ', e);
                      }

                      function success(fileEntry) {
                        var namePath = fileEntry.nativeURL.substr(0, fileEntry.nativeURL.lastIndexOf('/') + 1);
                        // Only copy because of access rights
                        $cordovaFile.copyFile(namePath, fileEntry.name, cordova.file.dataDirectory, newFileName).then(function(success){
                          $scope.image = newFileName;
                        }, function(error){
                          $scope.showAlert('Error', error.exception);
                        });
                      };
                    }
                );
              } else {
                var namePath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
                // Move the file to permanent storage
                $cordovaFile.moveFile(namePath, currentName, cordova.file.dataDirectory, newFileName).then(function(success){
                  $scope.image = newFileName;
                }, function(error){
                  $scope.showAlert('Error', error.exception);
                });
              }
            },
            function(err){
              // Not always an error, maybe cancel was pressed...
            })
      };

      $scope.pathForImage = function(image) {
        if (image === null) {
          return '';
        } else {
          return cordova.file.dataDirectory + image;
        }
      };

      $scope.loadImage = function() {
        var options = {
          title: 'Select Image Source',
          buttonLabels: ['Load from Library', 'Use Camera'],
          addCancelButtonWithLabel: 'Cancel',
          androidEnableCancelButton : true,
       };

        $cordovaActionSheet.show(options).then(function(btnIndex) {
          var type = null;
          if (btnIndex === 1) {
            type = Camera.PictureSourceType.PHOTOLIBRARY;
          } else if (btnIndex === 2) {
            type = Camera.PictureSourceType.CAMERA;
          }
          if (type !== null) {
            $scope.selectPicture(type);
          }
        });
      };

      $scope.uploadImage = function() {
        // Destination URL
        var url = "https://www.colligur.com/api/upload.php";

        // File for Upload
        var targetPath = $scope.pathForImage($scope.image);

        // File name only
        var filename = $scope.image;;

        var options = {
          fileKey: "file",
          fileName: filename,
          chunkedMode: false,
          mimeType: "multipart/form-data",
          params : {'fileName': filename}
        };

        $cordovaFileTransfer.upload(url, targetPath, options).then(function(result) {
          $scope.formData.image = result;
         // $scope.showAlert('Success', result);
          $scope.showAlert('Success', 'Image upload finished.');
        });
      }

      $scope.product_condition = [
        { text: "Used", value: "2", },
        { text: "Like New", value: "4" },
        { text: "Brand New", value: "1" },
        { text: "Refurbished", value: "3" }
      ];

       $scope.types = [
        { text: "Price", value: "1" },
        { text: "Free", value: "2" },
        { text: "Contact", value: "3" },
        { text: "Swap", value: "4" }
      ];


      $scope.ChangeType = function(){
          if($scope.formData.type != 1){
             $scope.PriceVisible = false
             $scope.formData.price = ''
          } else {
            $scope.PriceVisible = true
          }
      }

      $scope.saveProduct = function(){
        console.log($scope.formData);
        $scope.formData.user_id = 0
        BuySellService.postBuySell($scope.formData);
      }

})

.controller('BuySellDetailCtrl', function($scope, $stateParams, ShopService,BuySellService, $ionicPopup, $ionicLoading) {
      var productId = $stateParams.productId;
      BuySellService.getBuySellDetail(productId).then(function(product){
        $scope.product = product;
        console.log(product)
      });


        BuySellService.getBuySellRelated(productId).then(function(products){
          $scope.related_products = products;
        });
      // show add to cart popup on button click
      $scope.showAddToCartPopup = function(product) {
        $scope.data = {};
        $scope.data.product = product;
        $scope.data.productOption = 1;
        $scope.data.productQuantity = 1;

        var myPopup = $ionicPopup.show({
          cssClass: 'add-to-cart-popup',
          templateUrl: 'views/app/shop/partials/add-to-cart-popup.html',
          title: 'Add to Cart',
          scope: $scope,
          buttons: [
            { text: '', type: 'close-popup ion-ios-close-outline' },
            {
              text: 'Add to cart',
              onTap: function(e) {
                return $scope.data;
              }
            }
          ]
        });
        myPopup.then(function(res) {
          if(res)
          {
            $ionicLoading.show({ template: '<ion-spinner icon="ios"></ion-spinner><p style="margin: 5px 0 0 0;">Adding to cart</p>', duration: 1000 });
            ShopService.addProductToCart(res.product);
            console.log('Item added to cart!', res);
          }
          else {
            console.log('Popup closed');
          }
        });
      };
    })




.controller('ShopCtrl', function($scope, ShopService) {
  console.log('asd')
  $scope.products = [];
  $scope.popular_products = [];

  ShopService.getProducts().then(function(products){
    $scope.products = products;
  });



  ShopService.getProducts().then(function(products){
    $scope.popular_products = products.slice(0, 2);
  });
})


.controller('ShoppingCartCtrl', function($scope, ShopService, $ionicActionSheet, _) {
  $scope.products = ShopService.getCartProducts();

  $scope.removeProductFromCart = function(product) {
    $ionicActionSheet.show({
      destructiveText: 'Remove from cart',
      cancelText: 'Cancel',
      cancel: function() {
        return true;
      },
      destructiveButtonClicked: function() {
        ShopService.removeProductFromCart(product);
        $scope.products = ShopService.getCartProducts();
        return true;
      }
    });
  };

  $scope.getSubtotal = function() {
    return _.reduce($scope.products, function(memo, product){ return memo + product.price; }, 0);
  };

})


.controller('BookCtrl', function($scope,$localStorage ,$timeout,BookService,$stateParams ,$state,$ionicPopup,$ionicModal) {
  $scope.keyword = $stateParams.keyword
  $scope.products = [];
  $scope.input = [];
  $scope.book_categories = [];
  $scope.products_count = [];
  $scope.page = 0
  $scope.total_records = 0
  $scope.$storage = localStorage
  $scope.loadMoreAck = true
  $scope.catText = $scope.$storage.BookCatText




    BookService.getCategories().then(function(data){
        $scope.book_categories = data
  })

  $scope.$on('$ionicView.enter', function(){
      $scope.catText = $scope.$storage.BookCatText
      BookService.getBooks($scope.page,$scope.$storage.BookCatId, $scope.keyword).then(function(data){
      $scope.products  = data

      BookService.totalRecords($scope.$storage.BookCatId,$scope.keyword).then(function(de){
              $scope.total_records = de
      });
  });

  });

  $scope.loadMore = function() {
    $scope.page  =  $scope.page  + 1
    BookService.getBooks($scope.page,$scope.$storage.BookCatId).then(function(data){
      angular.forEach(data, function(value, key) {
        $scope.products.push(value)
      })
    });
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
        $scope.$storage.BuySellCatText = text
        $scope.catText = $scope.$storage.BookCatText


      $scope.BookPopup.close()
    }

  $scope.HitSearch =function () {
        $state.go('app.shop.book',{keyword:$scope.input.searchTXT})
        $scope.filter.hide();
        $scope.catText = $scope.$storage.BookCatText

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
})

.controller('BookDetailCtrl', function($scope, $stateParams, ShopService,BookService, $ionicPopup, $ionicLoading) {
      var productId = $stateParams.productId;
        BookService.getBookDetail(productId).then(function(product){
          $scope.product = product;
          console.log(product)
        });

        BookService.getBookRelated(productId).then(function(products){
        $scope.related_products = products;
  });
})

.controller('BookAddCtrl', function($scope, $stateParams,$localStorage,BuySellService,BookService, $ionicPopup, $ionicLoading, $cordovaCamera, $cordovaFile, $cordovaFileTransfer, $cordovaDevice,$cordovaActionSheet) {
      $scope.formData = {};
      $scope.PriceVisible = true
      $scope.Catgories = [];
      $scope.conditions = [];
      $scope.image = null;
      $scope.$storage = localStorage;

      BookService.getCategories().then(function (categories) {
        $scope.Catgories = categories
      })

      $scope.showAlert = function(title, msg) {
        var alertPopup = $ionicPopup.alert({
          title: title,
          template: msg
        });
      };

      $scope.selectPicture = function(sourceType) {
        var options = {
          quality: 100,
          destinationType: Camera.DestinationType.FILE_URI,
          sourceType: sourceType,
          saveToPhotoAlbum: false
        };

        $cordovaCamera.getPicture(options).then(function(imagePath) {
              // Grab the file name of the photo in the temporary directory
              var currentName = imagePath.replace(/^.*[\\\/]/, '');

              //Create a new name for the photo
              var d = new Date(),
                  n = d.getTime(),
                  newFileName =  n + ".jpg";

              // If you are trying to load image from the gallery on Android we need special treatment!
              if ($cordovaDevice.getPlatform() == 'Android' && sourceType === Camera.PictureSourceType.PHOTOLIBRARY) {
                window.FilePath.resolveNativePath(imagePath, function(entry) {
                      window.resolveLocalFileSystemURL(entry, success, fail);
                      function fail(e) {
                        console.error('Error: ', e);
                      }

                      function success(fileEntry) {
                        var namePath = fileEntry.nativeURL.substr(0, fileEntry.nativeURL.lastIndexOf('/') + 1);
                        // Only copy because of access rights
                        $cordovaFile.copyFile(namePath, fileEntry.name, cordova.file.dataDirectory, newFileName).then(function(success){
                          $scope.image = newFileName;
                        }, function(error){
                          $scope.showAlert('Error', error.exception);
                        });
                      };
                    }
                );
              } else {
                var namePath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
                // Move the file to permanent storage
                $cordovaFile.moveFile(namePath, currentName, cordova.file.dataDirectory, newFileName).then(function(success){
                  $scope.image = newFileName;
                }, function(error){
                  $scope.showAlert('Error', error.exception);
                });
              }
            },
            function(err){
              // Not always an error, maybe cancel was pressed...
            })
      };

      $scope.pathForImage = function(image) {
        if (image === null) {
          return '';
        } else {
          return cordova.file.dataDirectory + image;
        }
      };



      $scope.loadImage = function() {
        var options = {
          title: 'Select Image Source',
          buttonLabels: ['Load from Library', 'Use Camera'],
          addCancelButtonWithLabel: 'Cancel',
          androidEnableCancelButton : true,
        };


        $cordovaActionSheet.show(options).then(function(btnIndex) {
          var type = null;
          if (btnIndex === 1) {
            type = Camera.PictureSourceType.PHOTOLIBRARY;
          } else if (btnIndex === 2) {
            type = Camera.PictureSourceType.CAMERA;
          }
          if (type !== null) {
            $scope.selectPicture(type);
          }
        });
      };

      $scope.uploadImage = function() {
        // Destination URL
        var url = "https://www.colligur.com/api/upload.php";

        // File for Upload
        var targetPath = $scope.pathForImage($scope.image);

        // File name only
        var filename = $scope.image;;

        var options = {
          fileKey: "file",
          fileName: filename,
          chunkedMode: false,
          mimeType: "multipart/form-data",
          params : {'fileName': filename}
        };

        $cordovaFileTransfer.upload(url, targetPath, options).then(function(result) {
          $scope.formData.image = result;
          // $scope.showAlert('Success', result);
          $scope.showAlert('Success', 'Image upload finished.');
        });
      }

      $scope.product_condition = [
        { text: "Used", value: "2", },
        { text: "Like New", value: "4" },
        { text: "Brand New", value: "1" }
      ];



      $scope.saveProduct = function(){
         $scope.formData.user_id = $scope.$storage.u_id
          BookService.postBook($scope.formData);
      }

    })


.controller('SettingsCtrl', function($scope, $ionicModal) {

  $ionicModal.fromTemplateUrl('views/app/legal/terms-of-service.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.terms_of_service_modal = modal;
  });

  $ionicModal.fromTemplateUrl('views/app/legal/privacy-policy.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.privacy_policy_modal = modal;
  });

  $scope.showTerms = function() {
    $scope.terms_of_service_modal.show();
  };

  $scope.showPrivacyPolicy = function() {
    $scope.privacy_policy_modal.show();
  };

});





;

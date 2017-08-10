angular.module('your_app_name.app.services', [])




.service('AuthService', function ($http,$q){
  this.Auth = function(GM,id){
    var dfd = $q.defer();
    $http({
      method: "GET",
      params: {
        GM: GM,
        id : id,
      },
      url: "https://www.colligur.com/api/auth.php",
      isArray: true
    }).success(function(data, status) { dfd.resolve( data);
    }).error(function(data, status) { });
    return dfd.promise;
  };
  this.postUser = function($data){
    var dfd = $q.defer();
    $http({
      method: 'POST',
      url:  "https://www.colligur.com/api/auth_register.php",
      data: $data,
      headers: {'Content-Type': 'application/x-www-form-urlencoded',}
    }).then(function successCallback(response) {
      dfd.resolve( response);
    });
    return dfd.promise;
  };
})

.service('PostService', function ($http, $q){

  this.getPostComments = function(post){
    var dfd = $q.defer();

    $http.get('database.json').success(function(database) {
      var comments_users = database.users;

      // Randomize comments users array
      comments_users = window.knuthShuffle(comments_users.slice(0, post.comments));

      var comments_list = [];
      // Append comment text to comments list
      comments_list = _.map(comments_users, function(user){
        var comment = {
          user: user,
          text: database.comments[Math.floor(Math.random()*database.comments.length)].comment
        };
        return comment;
      });

      dfd.resolve(comments_list);
    });

    return dfd.promise;
  };

  this.getUserDetails = function(userId){
    var dfd = $q.defer();

    $http.get('database.json').success(function(database) {
      //find the user
      var user = _.find(database.users, function(user){ return user._id == userId; });
      dfd.resolve(user);
    });

    return dfd.promise;
  };

  this.getUserPosts = function(userId){
    var dfd = $q.defer();

    $http.get('database.json').success(function(database) {

      //get user posts
      var userPosts =  _.filter(database.posts, function(post){ return post.userId == userId; });
      //sort posts by published date
      var sorted_posts = _.sortBy(userPosts, function(post){ return new Date(post.date); });

      //find the user
      var user = _.find(database.users, function(user){ return user._id == userId; });

      //add user data to posts
      var posts = _.each(sorted_posts.reverse(), function(post){
        post.user = user;
        return post;
      });

      dfd.resolve(posts);
    });

    return dfd.promise;
  };

  this.getUserLikes = function(userId){
    var dfd = $q.defer();

    $http.get('database.json').success(function(database) {
      //get user likes
      //we will get all the posts
      var slicedLikes = database.posts.slice(0, 4);
      // var sortedLikes =  _.sortBy(database.posts, function(post){ return new Date(post.date); });
      var sortedLikes =  _.sortBy(slicedLikes, function(post){ return new Date(post.date); });

      //add user data to posts
      var likes = _.each(sortedLikes.reverse(), function(post){
        post.user = _.find(database.users, function(user){ return user._id == post.userId; });
        return post;
      });

      dfd.resolve(likes);

    });

    return dfd.promise;

  };

  this.getFeed = function(page){

    var pageSize = 5, // set your page size, which is number of records per page
        skip = pageSize * (page-1),
        totalPosts = 1,
        totalPages = 1,
        dfd = $q.defer();

    $http.get('database.json').success(function(database) {

      totalPosts = database.posts.length;
      totalPages = totalPosts/pageSize;

      var sortedPosts =  _.sortBy(database.posts, function(post){ return new Date(post.date); }),
          postsToShow = sortedPosts.slice(skip, skip + pageSize);

      //add user data to posts
      var posts = _.each(postsToShow.reverse(), function(post){
        post.user = _.find(database.users, function(user){ return user._id == post.userId; });
        return post;
      });

      dfd.resolve({
        posts: posts,
        totalPages: totalPages
      });
    });

    return dfd.promise;
  };
})

.service('BuySellService', function ($http, $q, _){
  this.getBuySell = function($page,$cat_id,$keyword){
    var dfd = $q.defer();
    $http({
      method: "JSONP",
      params: {
        input: "GM",
        page : $page ,
        cat_id :$cat_id,
        keyword :$keyword,
        callback: "stock_search"
      },
      url: "http://www.colligur.com/breweries",
      isArray: true
    }).success(function(data, status) {}).error(function(data, status) { });
    stock_search = function  (data) {
      dfd.resolve( data);
    }
    return dfd.promise;
  };
  this.totalRecords = function($cat_id,$keyword){
    var dfd = $q.defer();
    $http({
      method: "GET",
      params: {
        input: "GM",
        cat_id :$cat_id,
        keyword :$keyword,
      },
      url: "https://www.colligur.com/api/buysell.php",
      isArray: true
    }).success(function(data, status) { dfd.resolve( data);
       }).error(function(data, status) { });


    return dfd.promise;
  };

  this.getBuySellDetail = function($id){
    var dfd = $q.defer();
    $http({
      method: "JSONP",
      params: {
        input: "GM",
        callback: "buysell_detail"
      },
      url: "https://www.colligur.com/breweries/"+$id,
      isArray: true
    }).success(function(data, status) {}).error(function(data, status) { });
    buysell_detail = function  (data) {
      dfd.resolve( data);
    }
    return dfd.promise;
  };

  this.getBuySellRelated = function($id){
    var dfd = $q.defer();
    $http({
      method: "JSONP",
      params: {
        input: "GM",
        callback: "buysell_related"
      },
      url: "https://www.colligur.com/breweries/related/"+$id,
      isArray: true
    }).success(function(data, status) {}).error(function(data, status) { });
    buysell_related = function  (data) {
      dfd.resolve( data);
    }
    return dfd.promise;
  };
  this.BuySellCategories = function () {
    var dfd = $q.defer();
    $http({
      method: "JSONP",
      params: {
        input: "GM",
        callback: "buysell_categories"
      },
      url: "https://www.colligur.com/breweries_categories",
      isArray: true
    }).success(function(data, status) {}).error(function(data, status) { });
    buysell_categories = function  (data) {
      dfd.resolve( data);
    }
    return dfd.promise;

  }
  this.postBuySell = function($data){
    var dfd = $q.defer();
    $http({
      method: 'POST',
      url:  "https://www.colligur.com/api/create_buysell.php",
      data: $data,
      headers: {'Content-Type': 'application/x-www-form-urlencoded',}
    }).then(function successCallback(response) {

    });

    return dfd.promise;
  };


})
.service('Universcities', function ($http, $q, _){
      this.getUniverscities = function($page){
        var dfd = $q.defer();
        $http({
          method: "JSONP",
          params: {
            input: "GM",
            page : $page ,
            callback: "uni"
          },
          url: "https://www.colligur.com/universitiesREST",
          isArray: true
        }).success(function(data, status) {}).error(function(data, status) { });
        uni = function  (data) {
          dfd.resolve( data);
        }
        return dfd.promise;
      };

  })


.service('BookService', function ($http, $q, _){
    this.getCategories = function (){
        var dfd = $q.defer();
            $http({
              method: "JSONP",
              params: {
                input: "GM",
                callback: "book_categories"
              },
              url: "https://www.colligur.com/book_categoriesREST",
              isArray: true
            }).success(function(data, status) {}).error(function(data, status) { });
            book_categories = function  (data) {
              dfd.resolve( data);
            }
            return dfd.promise;
    } , this.getBooks = function($page,$cat_id, $keyword){
        var dfd = $q.defer();
        $http({
          method: "JSONP",
          params: {
            page : $page ,
            cat_id :$cat_id,
            callback: "book_search",
            keyword :$keyword,
          },
          url: "http://www.colligur.com/bookREST",
          isArray: true
        }).success(function(data, status) {}).error(function(data, status) { });
      book_search = function  (data) {
          dfd.resolve( data);
        }
        return dfd.promise;
      };
      this.totalRecords = function($cat_id,$keyword){
        var dfd = $q.defer();
        $http({
          method: "GET",
          params: {
            input: "GM",
            cat_id :$cat_id,
            keyword :$keyword,
          },
          url: "https://www.colligur.com/api/book.php",
          isArray: true
        }).success(function(data, status) { dfd.resolve( data);
       }).error(function(data, status) { });


        return dfd.promise;
      };
      this.getBookDetail = function($id){
        var dfd = $q.defer();
        $http({
          method: "JSONP",
          params: {
            input: "GM",
            callback: "book_detail"
          },
          url: "https://www.colligur.com/bookREST/"+$id,
          isArray: true
        }).success(function(data, status) {}).error(function(data, status) { });
        book_detail = function  (data) {
          dfd.resolve( data);
        }
        return dfd.promise;
      };

      this.getBookRelated = function($id){
        var dfd = $q.defer();
        $http({
          method: "JSONP",
          params: {
            input: "GM",
            callback: "book_related"
          },
          url: "https://www.colligur.com/bookREST/related/"+$id,
          isArray: true
        }).success(function(data, status) {}).error(function(data, status) { });
        book_related = function  (data) {
          dfd.resolve( data);
        }
        return dfd.promise;
      };

      this.postBook = function($data){
        var dfd = $q.defer();
        $http({
          method: 'POST',
          url:  "https://www.colligur.com/api/create_book.php",
          data: $data,
          headers: {'Content-Type': 'application/x-www-form-urlencoded',}
        }).then(function successCallback(response) {

        });
        return dfd.promise;
      };






})
.service('ShopService', function ($http, $q, _){

  this.getProducts = function(){
    var dfd = $q.defer();
    $http.get('database.json').success(function(database) {
      dfd.resolve(database.products);
    });
    return dfd.promise;
  };

  this.getProduct = function(productId){
    var dfd = $q.defer();
    $http.get('database.json').success(function(database) {
      var product = _.find(database.products, function(product){ return product._id == productId; });

      dfd.resolve(product);
    });
    return dfd.promise;
  };

  this.addProductToCart = function(productToAdd){
    var cart_products = !_.isUndefined(window.localStorage.ionTheme1_cart) ? JSON.parse(window.localStorage.ionTheme1_cart) : [];

    //check if this product is already saved
    var existing_product = _.find(cart_products, function(product){ return product._id == productToAdd._id; });

    if(!existing_product){
      cart_products.push(productToAdd);
    }

    window.localStorage.ionTheme1_cart = JSON.stringify(cart_products);
  };

  this.getCartProducts = function(){
    return JSON.parse(window.localStorage.ionTheme1_cart || '[]');
  };

  this.removeProductFromCart = function(productToRemove){
    var cart_products = JSON.parse(window.localStorage.ionTheme1_cart);

    var new_cart_products = _.reject(cart_products, function(product){ return product._id == productToRemove._id; });

    window.localStorage.ionTheme1_cart = JSON.stringify(new_cart_products);
  };

});




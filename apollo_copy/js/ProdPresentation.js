$(document).ready(function () {
    //Note :- Called from ProductGE MS CatalogLinkButton.cshtml element
    //PresentionButtonCount();
    var countval = parseInt($(".presentation-count").text());
    $(".presentation-count").show();
    $(document).on('change', '.chkPresentation', function () {
        //debugger;
        var ProductGUId = $(this).attr('data-value');
        var removePresentation = $(this).attr('data-RemovePresentation');
        var addPresentation = $(this).attr('data-addpresentaion');
        ProductGUId = EncodeProductcode(ProductGUId);
        var _this = $(this);
        if ($(this)[0].checked) {
            $(".compare-count .badge").show();
            var ProductGUIds = getCookie('ProductPresentation');
            if (ProductGUIds != "") {
                ProductGUIds = ProductGUIds.replace(/\'/g, "");
                ProductGUIds = ProductGUIds.substring(0, ProductGUIds.length - 1);
                var products = ProductGUIds.split('~');
                if (products.indexOf(ProductGUId) > -1) {
                    popupV2({ content: ProdAlready, type: 'warning', title: ProdTitleWarning, actions: [{ dismiss: true, text: ProdActionOK }] });
                    $(this)[0].checked = true;
                    return false;
                }
                /// Commented as NO-limit for presentation
                //if (products.length >= 10) {
                //  popupV2({ content: 'MaximumProductMsg', title: 'warning' });
                //  popupV2({ content:'@GlobalFunctions.GetResourceHeader( "Product.MaximumProductMsg", ViewBag.ResourceRepo, ViewBag.WebsiteGuid, ViewBag.LanguageGuid, ViewBag.DefaultLanguageGuid, ViewBag.MemoryCache)', type:'warning' });
                //  $(this)[0].checked = false;
                //  return false;
                //
            }
            //if (getCookie('ProductPresentation').indexOf(ProductGUId + "~") == -1) {
            if (!checkProductCodeInPresentation(ProductGUId, "ProductPresentation")) {
                if (isLoginUser && isPresentationCreation) {
                    AddRemoveNewProduct(ProductGUId, true, _this);
                }
                else {
                    setCookiePresentation("ProductPresentation", getCookie('ProductPresentation') + ProductGUId + "~", 1);
                    $(this).next('span').text(removePresentation);
                }
            }
        }
        else {
            //ProductGUId = DecodeProductcode(ProductGUId);
            //if (getCookie('ProductPresentation').indexOf(ProductGUId + '~') != -1) {
            if (checkProductCodeInPresentation(ProductGUId, "ProductPresentation")) {
                if (isLoginUser && isPresentationCreation) {
                    AddRemoveNewProduct(ProductGUId, false, _this);
                }
                else {
                    //setCookiePresentation("ProductPresentation", getCookie('ProductPresentation').replace((ProductGUId + "~"), ''), 1);
                    setCookiePresentation("ProductPresentation", RemoveProductCodeFromPresentation(ProductGUId, "ProductPresentation"), 1);
                    $(this).next('span').text(addPresentation);
                }
            }
        }

        if (!isPresentationCreation || (!isLoginUser && isPresentationCreation)) {
            var ProductGUIds = getCookie('ProductPresentation');
            if (ProductGUIds != "") {
                ProductGUIds = ProductGUIds.replace(/\'/g, "");
                ProductGUIds = ProductGUIds.substring(0, ProductGUIds.length - 1);
                var products = ProductGUIds.split('~');

                var animDuration = 1500;
                if (_this[0].checked) {
                    catalogPresentationNotification(_this, animDuration);
                    setTimeout(function () {
                        //$(".presentation-count .badge").html(products.length);
                        PresentionButtonCount();
                    }, animDuration);
                    //setTimeout(function () {
                    //    popupV2({ content:'Product Added for Presentation', type:'success' });
                    //}, animDuration / 2);
                } else {
                    //$(".presentation-count .badge").html(products.length);
                    PresentionButtonCount();
                }
                $(".presentation-count").show();
            }
            else {
                $(".presentation-count .badge").show().text(0);
            }
        }
    });

    $(document).on('change', '.chkCompare', function () {
        if ($(this)[0].checked) {
            $(this).addClass("checked");
            $(this).parent("label").addClass("checked");
            //$(this).next('span').text("Remove From Compare");
        }
        else {
            $(this).removeClass("checked");
            $(this).parent("label").removeClass("checked");
            //$(this).next('span').text("Compare");
        }
    });

    $(document).on('change', '.chkPresentation', function () {
        if ($(this)[0].checked) {
            $(this).addClass("checked");
            $(this).parent("label").addClass("checked");
            //$(this).next('span').text("Remove From Presentation");
        }
        else {
            $(this).removeClass("checked");
            $(this).parent("label").removeClass("checked");
            //$(this).next('span').text("Presentation");
        }
    });

    //$(document).on('change', '.chkWishlist', function () {
    //    if ($(this)[0].checked) {
    //        $(this).addClass("checked");
    //        $(this).parent("label").addClass("checked");
    //        //$(this).next('span').text("Remove From Presentation");
    //    }
    //    else {
    //        $(this).removeClass("checked");
    //        $(this).parent("label").removeClass("checked");
    //        //$(this).next('span').text("wishlist");
    //    }
    //});
})

function PresentionButtonCount() {
    //debugger;
    //var ProductGUIds = getCookie('ProductPresentation');
    //if (ProductGUIds != "") {
    //    ProductGUIds = ProductGUIds.replace(/\'/g, "");
    //    ProductGUIds = ProductGUIds.substring(0, ProductGUIds.length - 1);
    //    var products = ProductGUIds.split('~');

    //    var count = 0;
    //    var showPresentationCount = setInterval(function () {
    //        count++;
    //        if ($(".dropdown-menu li.aCurrency").length != 0 || $("#DrpDwnLanguageGuidsId option").length != 0) {
    //            if ($(".dropdown-menu li.aCurrency").length <= 1 && $("#DrpDwnLanguageGuidsId option").length <= 1) {
    //                clearInterval(showPresentationCount);
    //                $(".presentation-count .badge").html(products.length);
    //            }
    //            else {
    //                //console.log("api called");
    //                clearInterval(showPresentationCount);
    //                FilterPresentionButtonCount(ProductGUIds, "count");
    //            }
    //        }
    //        if (count > 10) {
    //            //console.log("counter called");
    //            clearInterval(showPresentationCount);
    //            $(".presentation-count .badge").html(products.length);
    //        }
    //    }, 150);
    //}
    //else {
    //    $(".presentation-count .badge").show().text(0);
    //}


    //var ProductGUIds = getCookie('ProductPresentation');
    //if (ProductGUIds != "") {
    //    ProductGUIds = ProductGUIds.replace(/\'/g, "");
    //    ProductGUIds = ProductGUIds.substring(0, ProductGUIds.length - 1);
    //    var products = ProductGUIds.split('~');

    var count = 0;
    var showPresentationCount = setInterval(function () {
        if ($(".dropdown-menu li.aCurrency").length != 0 || $("#DrpDwnLanguageGuidsId option").length != 0) {
            if ($(".dropdown-menu li.aCurrency").length <= 1 && $("#DrpDwnLanguageGuidsId option").length <= 1) {
                clearInterval(showPresentationCount);

                var ProductGUIds = getCookie('ProductPresentation');
                //console.log(count);
                //console.log("single currency counter called");
                //console.log("current cookie :-" + ProductGUIds);

                if (ProductGUIds != "") {
                    ProductGUIds = ProductGUIds.replace(/\'/g, "");
                    ProductGUIds = ProductGUIds.substring(0, ProductGUIds.length - 1);
                    var products = ProductGUIds.split('~');
                    $(".presentation-count .badge").html(products.length);
                }
                else
                    $(".presentation-count .badge").show().text(0);
            }
            else {
                //console.log("api called");
                clearInterval(showPresentationCount);                
                var ProductGUIds = getCookie('ProductPresentation');
                //console.log(count);
                //console.log("Multiple currency counter called");
                //console.log("current cookie :-" + ProductGUIds);
                if (ProductGUIds != "") 
                    FilterPresentionButtonCount(ProductGUIds, "count");
                else
                    $(".presentation-count .badge").show().text(0);
            }
        }
        if (count > 10) {
            //console.log("counter called");
            clearInterval(showPresentationCount);
            var ProductGUIds = getCookie('ProductPresentation');
            //console.log(count);
            //console.log("counter called");
            //console.log("current cookie :-" + ProductGUIds);
            if (ProductGUIds != "") {
                ProductGUIds = ProductGUIds.replace(/\'/g, "");
                ProductGUIds = ProductGUIds.substring(0, ProductGUIds.length - 1);
                var products = ProductGUIds.split('~');
                $(".presentation-count .badge").html(products.length);
            }
            else
                $(".presentation-count .badge").show().text(0);
        }
        count++;
    }, 200);
    //}
    //else {
    //    $(".presentation-count .badge").show().text(0);
    //}
}

//Filter Product List by LanguageGuid and CurrencyGUID
function FilterPresentionButtonCount(products, action) {
    products = DecodeProductcode(products);
    var ProductList = products.split('~');
    var url = SaaS_Product_Microservice_Url + 'api/CatalogProducts/GetFilteredProductList';
    var objAjax = {};
    objAjax.url = url;
    objAjax.type = 'POST';
    objAjax.headers = { "LanguageGuid": languageuid, "WebsiteGuid": websiteguid, "CurrencyGuid": currencyguid, "CookieDetails": cookiedetails };
    objAjax.dataType = 'json';
    objAjax.data = JSON.stringify(ProductList);
    objAjax.OnSuccess = function (data) {
        //console.log("Multiple currency function called :-" + data);
        if (data != "") {
            data = data.substring(0, data.length - 1);
            var products = EncodeProductcode(data).split('~');
            if (action.toLowerCase() == "count") {
                $(".presentation-count .badge").html(products.length);
            }
            else if (action.toLowerCase() == "list") {
                document.cookie = "ProductPresentation=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                for (var i = 0; i < products.length; i++) {
                    //if (getCookie('ProductPresentation').indexOf(products[i] + "~") == -1) {
                    if (!checkProductCodeInPresentation(products[i], "ProductPresentation")) {
                        setCookiePresentation("ProductPresentation", getCookie('ProductPresentation') + products[i] + "~", 1);
                    }
                }

                data = data.replace(/#|~/g, ',');
                data = DecodeProductcode(data);
                GenerateCatalogGuid(data);
                console.log(data);
            }
        }
        else if (data == "") {
            $(".presentation-count .badge").html(0);
        }
    };
    objAjax.OnError = function (msg) {

    };
    objAjax.isAsync = true;
    objAjax.MicroserviceName = 'SaaS_Product_Microservice';
    objAjax.contentType = 'application/json;charset=utf-8';
    callApi(objAjax);
}


function catalogPresentationNotification(elem, animDuration) {
    var _startPos = $(elem).offset();
    var _endPos = $(".presentation-count .badge").offset();
    var _id = new Date().getTime();
    $("<div class='oneUpNotification badge badge-primary presentationNotification' id='" + _id + "'>+1</div>").appendTo("body");
    $("#" + _id).css({
        "top": _startPos.top,
        "left": _startPos.left
    });
    $("#" + _id).animate({
        top: _endPos.top,
        left: _endPos.left
    }, (animDuration - 250), "swing", function () {
        $("#" + _id).fadeOut(250);
        setTimeout(function () {
            $("#" + _id).remove();
        }, 300);
    });
}
$(document).on('click', '.presentation-count', function (e) {    

    if (isLoginUser && isPresentationCreation && !isRedirectFromProductList) {
        window.location = "/Catalog/Presentation";
    }
    else if (!isLoginUser || (isLoginUser && !isPresentationCreation) || (isLoginUser && isPresentationCreation && isRedirectFromProductList)) {
        $('.animsition-loading').show();
        var ProductGUIds = getCookie('ProductPresentation');
        var PopupErrorMsg = $(this).attr('data-errmsg');


        //Code will run if single currency dropdown
        if ($(".dropdown-menu li.aCurrency").length <= 1 && $("#DrpDwnLanguageGuidsId option").length <= 1) {
            if (ProductGUIds != "") {
                ProductGUIds = ProductGUIds.substring(0, ProductGUIds.length - 1);
                var products = ProductGUIds.split('~');
                if (products.length < 1) {
                    $('.animsition-loading').hide();
                    popupV2({ content: PopupErrorMsg, type: 'warning', title: ProdTitleWarning, actions: [{ dismiss: true, text: ProdActionOK }] });
                    isRedirectFromProductList = false;
                    return false;
                }
            }
            else if (ProductGUIds == "" && CreatePresentationWithoutProduct && IsUserLogIn()) {
                //Function is written in ProductGEMS => CatalogLinkButton.cshtml
                GenerateCatalogWithoutProduct();
            }
            else {
                $('.animsition-loading').hide();
                popupV2({ content: PopupErrorMsg, type: 'warning', title: ProdTitleWarning, actions: [{ dismiss: true, text: ProdActionOK }] });
                isRedirectFromProductList = false;
                return false;
            }
        }
        //Code will run if multiple currency dropdown
        else {
            if ($(".presentation-count .badge").html() != "") {
                if (parseInt($(".presentation-count .badge").html()) < 1) {
                    if (CreatePresentationWithoutProduct && IsUserLogIn()) {
                        //Function is written in ProductGEMS => CatalogLinkButton.cshtml
                        GenerateCatalogWithoutProduct();
                    }
                    else if ((CreatePresentationWithoutProduct && IsUserLogIn() == false) || !CreatePresentationWithoutProduct) {
                        $('.animsition-loading').hide();
                        popupV2({ content: PopupErrorMsg, type: 'warning', title: ProdTitleWarning, actions: [{ dismiss: true, text: ProdActionOK }] });
                        isRedirectFromProductList = false;
                        return false;
                    }
                }
            }
            else if ($(".presentation-count .badge").html() == "" && CreatePresentationWithoutProduct && IsUserLogIn()) {
                //Function is written in ProductGEMS => CatalogLinkButton.cshtml
                GenerateCatalogWithoutProduct();
            }
            else {
                $('.animsition-loading').hide();
                popupV2({ content: PopupErrorMsg, type: 'warning', title: ProdTitleWarning, actions: [{ dismiss: true, text: ProdActionOK }] });
                isRedirectFromProductList = false;
                return false;
            }
        }

        if (IsUserLogIn()) {
            // ProductGUIds = ProductGUIds.allReplace({ '~': ','});
            if ($(".dropdown-menu li.aCurrency").length <= 1 && $("#DrpDwnLanguageGuidsId option").length <= 1) {
                ProductGUIds = ProductGUIds.replace(/#|~/g, ',');
                ProductGUIds = DecodeProductcode(ProductGUIds);
                GenerateCatalogGuid(ProductGUIds);
            }
            else if ($(".dropdown-menu li.aCurrency").length > 1 || $("#DrpDwnLanguageGuidsId option").length > 1) {
                FilterPresentionButtonCount(ProductGUIds, "list");
            }
        }
        else {
            $('.animsition-loading').hide();
        }
    }
});
function IsUserLogIn() {
    var MsgLoginRequired = $('.presentation-count').attr('data-message');
    //var islogin = false;
    let isPresLogin = false;
    jsonobj = $.parseJSON(cookiedetails.replace(/&quot;/g, '"'));
    if (jsonobj != null) {
        if (jsonobj.UserGuid != null) {
            //islogin = (jsonobj.UserGuid.length >= 1 ? true : false);
            isPresLogin = (jsonobj.UserGuid.length >= 1 ? true : false);
        }
        else {
            //islogin = false;
            isPresLogin = false;
        }
    }
    else {
        //islogin = false;
        isPresLogin = false;
    }
    if (!isPresLogin) {
        popupV2({
            // content: 'User must be logged in to go for Presentation, you will be redirected to login page.',
            content: MsgLoginRequired,
            type: 'confirm',
            title: ProdTitleConfirm,
            actions: [
                {
                    text: ProdConfirmYes,
                    do: function () {
                        redirectLoginPopup();
                    }
                },
                {
                    text: ProdConfirmNo,
                    dismiss: true
                }
            ]
        });        
    }
    return isPresLogin;
}

function redirectLoginPopup() {
    //debugger;
    var path = "";
    var startIndex = 0;
    while (window.location.pathname[startIndex] === '/') {
        startIndex++;
    }
    path = window.location.pathname.substr(startIndex);
    if (path == "" && isPresentationCreation)
        path = "Catalog/Presentation";

    $('.animsition-loading').hide();
    window.location.replace(WebsiteURL + 'Login' + '?returnurl=' + path);

}

// function GetCatalogAuthenticationToken(ProductGUIds) {

// var APiKeyDetails = {'GrantType':'Token','Key':'d58178e6-3a22-41e0-bc2f-fb3e3b2391e8','Secret':'a0a1f788-454e-414a-b75e-04be7c5fd913'};
// var url = SaaS_Catalog_URL + 'Authorization/Token';
// var objAjax = {};
// objAjax.url = url;
// objAjax.type = 'POST';
// objAjax.data = JSON.stringify(APiKeyDetails);
// objAjax.headers = {};
// //objAjax.dataType = 'json';
// objAjax.OnSuccess = function (data) {
// GenerateCatalogGuid(data.refreshToken, ProductGUIds);
// };
// objAjax.statusCode = {

// };
// objAjax.OnError = function (msg) {
// };
// objAjax.isAsync = true;
// objAjax.MicroserviceName = 'SaaS_Catalog_Microservice';
// objAjax.contentType = 'application/json;charset=utf-8';
// callApi(objAjax);

// //$.ajax({
// //    url: SaaS_Catalog_URL + 'Authorization/Token',
// //    type: 'POST',
// //    data: (APiKeyDetails),
// //    async: true,
// //    contentType: "application/json;charset=utf-8",
// //    success: function (response) {
// //        // alert(response.refreshToken);
// //        GenerateCatalogGuid(response.refreshToken, ProductGUIds);
// //    },
// //    error: function (e) {
// //    }
// //});
// }
function GenerateCatalogGuid(ProductGUIds) {

    if (typeof IsUserHasAccessCatalog !== "undefined" && IsUserHasAccessCatalog !== undefined && IsUserHasAccessCatalog !== "undefined" && IsUserHasAccessCatalog !== null) {
        if (!IsUserHasAccessCatalog) {
            $('.animsition-loading').hide();
            popupV2({ content: AccessDenied, type: 'warning', title: ProdTitleWarning, actions: [{ dismiss: true, text: ProdActionOK }] });
            return false;
        }
    }

    jsonobj = $.parseJSON(cookiedetails.replace(/&quot;/g, '"'));
    if (jsonobj != null && ProductGUIds.length > 0) {
        var UserProductdetails = {
            "UserDetails": {
                "FirstName": jsonobj.FirstName,
                "LastName": jsonobj.LastName,
                "EmailAddress": jsonobj.EmailAddress,
                "Address": "UK",
                "Phone": "+19898989898",
                "UserType": jsonobj.UserType,
                "UserGuid": jsonobj.UserGuid
            },
            "ProductCodes": [ProductGUIds]
        }

        var url = SaaS_Catalog_URL + 'api/Catalog/CatalogDetail';
        var objAjax = {};
        objAjax.url = url;
        objAjax.type = 'POST';
        objAjax.data = JSON.stringify(UserProductdetails);
        objAjax.headers = { "LanguageGuid": languageuid, "WebsiteGuid": websiteguid, "CurrencyGuid": currencyguid, "CookieDetails": cookiedetails, "DefaultLanguageGuid": defaultlanguageguid };
        objAjax.dataType = 'json';
        objAjax.OnSuccess = function (data) {
            //debugger;
            //isImagenBrandsCatalog :- variable is declared in ProductGE => CatalogLinkButton.cshtml
            $(".animsition-loading").hide();
            if (typeof isImagenBrandsCatalog !== "undefined" && isImagenBrandsCatalog != "" && isImagenBrandsCatalog != null && isImagenBrandsCatalog == true)
                window.location.href = WebsiteURL + 'Catalog/PresentationCreate/' + data;
            else{
				if (websiteguid === "B7E9DAB7-2B08-4D11-89E3-D9A88B63A734" || websiteguid === "39ACAFF4-3CA8-4B09-A55A-53C6502ACA64") {
                    window.location.href = WebsiteURL + 'Catalog/InstantCatalogView/' + data;
                }
                else {
                window.location.href = WebsiteURL + 'Catalog/landing/' + data;
				}
			}

            isRedirectFromProductList = false;
        };
        objAjax.statusCode = {

        };
        objAjax.OnError = function (msg) {
            $('.animsition-loading').hide();
            let temp = [];
            let PopupCatalogDetailError = $('.presentation-count').attr('data-popupcatalog');
            if (typeof PopupCatalogDetailError === 'undefined' || PopupCatalogDetailError == null || PopupCatalogDetailError == "")
                PopupCatalogDetailError = ProdRedirectError;
            popupV2({ content: PopupCatalogDetailError, type: 'error', title: ProdTitleError, actions: [{ dismiss: true, text: ProdActionOK }] });
            isRedirectFromProductList = false;
        };
        objAjax.isAsync = true;
        objAjax.MicroserviceName = 'SaaS_Catalog_Microservice';
        objAjax.contentType = 'application/json;charset=utf-8';
        callApi(objAjax);

        //$.ajax({
        //    url: SaaS_Catalog_URL + 'api/Catalog/CatalogDetail',
        //    type: 'POST',
        //    data: JSON.stringify(UserProductdetails),
        //    async: true,
        //    contentType: "application/json;charset=utf-8",
        //    beforeSend: function (xhr) {
        //        xhr.setRequestHeader('WebsiteGuid', websiteguid); // $("#hdnWebsiteGuid").val());
        //        xhr.setRequestHeader('LanguageGuid', languageuid); // $("#hdnLanguageGuid").val());
        //        xhr.setRequestHeader('CurrencyGuid', currencyguid);
        //        xhr.setRequestHeader('Token', token);
        //    },
        //    success: function (response) {
        //        window.location.href = WebsiteURL + 'Catalog/landing/' + response;
        //        // $('.animsition-loading').hide();
        //    },
        //    error: function (e) {
        //        $('.animsition-loading').hide();
        //        ShowModalPopUp("Can't redirect to Presentation, Something wrong!", "error")
        //    }
        //});
    }
}

if (getCookie("ProductPresentation") != "") {
    var ProductGUIds = getCookie("ProductPresentation");
    if (ProductGUIds != "") {
        ProductGUIds = ProductGUIds.replace(/\'/g, "");
        ProductGUIds = ProductGUIds.substring(0, ProductGUIds.length - 1);
        var products = ProductGUIds.split('~');
        $(".presentation-count").show().text(products.length);
    }
    else {
        //$(".presentation-count").hide();
        //$(".presentation-count").text(0);
        $(".presentation-count").show().text(0);
    }
}


function setCookiePresentation(cname, cvalue, exdays) {
    cvalue = EncodeProductcode(cvalue);
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
function checkCookie() {
    var ProductPresentation = getCookie("ProductPresentation");
    if (ProductPresentation != "") {
    } else {
        if (ProductPresentation != "" && ProductPresentation != null) {
            setCookiePresentation("ProductPresentation", ProductPresentation, 1);
        }
    }
}
function ClearPresentation() {
    document.cookie = "ProductPresentation=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    //alert("Cleared");
}


function EncodeProductcode(Name) {
    Name = replaceAllProdPresentation(Name, ".", "-dot-");
    Name = replaceAllProdPresentation(Name, "'", "-quote-");
    Name = replaceAllProdPresentation(Name, "&", "-and-");
    Name = replaceAllProdPresentation(Name, "+", "-plus-");
    Name = replaceAllProdPresentation(Name, "/", "-slash-");
    Name = replaceAllProdPresentation(Name, "\"", "-dbq-");
    Name = replaceAllProdPresentation(Name, "*", "-star-");
    Name = replaceAllProdPresentation(Name, "<", "-lt-");
    Name = replaceAllProdPresentation(Name, ">", "-gt-");
    Name = replaceAllProdPresentation(Name, ":", "-col-");
    Name = replaceAllProdPresentation(Name, "#", "-hash-");
    Name = replaceAllProdPresentation(Name, "%", "-per-");
    Name = replaceAllProdPresentation(Name, " ", "-space-");
    Name = replaceAllProdPresentation(Name, "Â®", "-reg-");
    Name = replaceAllProdPresentation(Name, "â„¢", "-trade-");
    Name = replaceAllProdPresentation(Name, "Â©", "-copy-");
    Name = replaceAllProdPresentation(Name, "â€", "-rdqm-");
    return Name;

}

function DecodeProductcode(Name) {
    Name = replaceAllProdPresentation(Name, "-dot-", ".");
    Name = replaceAllProdPresentation(Name, "-quote-", "'");
    Name = replaceAllProdPresentation(Name, "-and-", "&");
    Name = replaceAllProdPresentation(Name, "-plus-", "+");
    Name = replaceAllProdPresentation(Name, "-slash-", "/");
    Name = replaceAllProdPresentation(Name, "-dbq-", "\"");
    Name = replaceAllProdPresentation(Name, "-star-", "*");
    Name = replaceAllProdPresentation(Name, "-lt-", "<");
    Name = replaceAllProdPresentation(Name, "-gt-", ">");
    Name = replaceAllProdPresentation(Name, "-col-", ":");
    Name = replaceAllProdPresentation(Name, "-hash-", "#");
    Name = replaceAllProdPresentation(Name, "-per-", "%");
    Name = replaceAllProdPresentation(Name, "-space-", " ");
    Name = replaceAllProdPresentation(Name, "-reg-", "Â®");
    Name = replaceAllProdPresentation(Name, "-trade-", "â„¢");
    Name = replaceAllProdPresentation(Name, "-copy-", "Â©");
    Name = replaceAllProdPresentation(Name, "-rdqm-", "â€");
    return Name;
}

function replaceAllProdPresentation(string, find, replace) {
    return string.replace(new RegExp(escapeRegExpProdPresentation(find), 'g'), replace);
}

function escapeRegExpProdPresentation(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function AddRemoveNewProduct(productcode, action, _this) {
    var url = SaaS_ProductGE_URL + 'api/Products/UpdateNewProduct/' + productcode + "/" + action;
    var objAjax = {};
    objAjax.url = url;
    objAjax.type = 'get';
    objAjax.headers = { "LanguageGuid": languageuid, "WebsiteGuid": websiteguid, "CurrencyGuid": currencyguid, "CookieDetails": cookiedetails };
    objAjax.dataType = 'json';
    objAjax.OnSuccess = function (result) {
        //console.log(result);
        //debugger;
        if (result.isSuccess && result.msg == "") {
            if (action) {
                setCookiePresentation("ProductPresentation", getCookie('ProductPresentation') + productcode + "~", 1);
                $(_this).next('span').text($(_this).attr('data-RemovePresentation'));
            }
            else {
                //setCookiePresentation("ProductPresentation", getCookie('ProductPresentation').replace((productcode + "~"), ''), 1);
                setCookiePresentation("ProductPresentation", RemoveProductCodeFromPresentation(productcode, "ProductPresentation"), 1);
                $(_this).next('span').text($(_this).attr('data-addpresentaion'));
            }

            var ProductGUIds = getCookie('ProductPresentation');
            if (ProductGUIds != "") {
                ProductGUIds = ProductGUIds.replace(/\'/g, "");
                ProductGUIds = ProductGUIds.substring(0, ProductGUIds.length - 1);
                var products = ProductGUIds.split('~');

                var animDuration = 1500;
                if (_this[0].checked) {
                    catalogPresentationNotification(_this, animDuration);
                    setTimeout(function () {
                        PresentionButtonCount();
                    }, animDuration);
                } else {
                    PresentionButtonCount();
                }
                $(".presentation-count").show();
            }
            else {
                $(".presentation-count .badge").show().text(0);
            }
        }
        else if (result.isSuccess && result.msg != "") {
            popupV2({ content: result.msg, type: 'error', title: ProdTitleError, actions: [{ dismiss: true, text: ProdActionOK }] });
        }
        else if (!result.isSuccess) {
            popupV2({ content: ProdCountErrorMsg, type: 'error', title: ProdTitleError, actions: [{ dismiss: true, text: ProdActionOK }] });
        }
    };
    objAjax.OnError = function (msg) {
        popupV2({ content: ProdCountErrorMsg, type: 'error', title: ProdTitleError, actions: [{ dismiss: true, text: ProdActionOK }] });
    };
    objAjax.isAsync = true;
    objAjax.MicroserviceName = 'SaaS_Product_GlobalElements_Microservice';
    objAjax.contentType = 'application/json;charset=utf-8';
    callApi(objAjax);
}
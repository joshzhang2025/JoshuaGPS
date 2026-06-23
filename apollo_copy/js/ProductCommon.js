function GetBasketViewPopup(n) {
    var i = $(n).attr("Data-ProductGuid"),
        t;
    $("#hidGuid").val(i);
    t = $(n).attr("Data-ActionUrl");
    t = t + $(n).attr("Data-ProductGuid");
    GetbasketView(t, "Basket", !1)
}

function GetbasketView(n, t) {
    var i = {};
    i.url = n;
    i.type = "GET";
    i.data = {};
    i.contentType = "application/json;charset=utf-8";
    i.headers = {
        Accept: "text/html",
        WebSiteGuid: websiteguid,
        LanguageGuid: languageuid,
        CookieDetails: cookiedetails,
        CurrencyGuid: currencyguid,
        DefaultLanguageGuid: defaultlanguageguid
    };
    i.OnSuccess = function(n) {
        popupV2({
            content: n,
            title: t,
            classes: "AddToCart"
        })
    };
    i.statusCode = {};
    i.OnError = function() {};
    i.isAsync = !1;
    i.MicroserviceName = "SaaS_Product_Microservice";
    callApi(i)
}

function AddToWishList(n) {
    var i = $(n).attr("Data-ActionUrl"),
        t = $(n).attr("Data-ProductGuid"),
        r = $(n).attr("data-message");
    //Msgcommonok = $(n).attr("data-commonok");
    //MsgCommanconfirm = $(n).attr("data-Commanconfirm");
    $(".animsition-loading").show();
    CallAddToWishList(i, "Add To Wish List", !1, t, n, r, Msgcommonok, MsgCommanconfirm);
    IsLoginWishListStatus && $(n).attr("onclick", "RemoveProductFromWishList(this)");
    IsLoginWishListStatus = !1;
    eventInfo = {
        ProductGuid: t
    };
    SaveCampaignAnalytics("Add to wishlist Click", eventInfo)
}

function RemoveProductFromWishList(n) {
    var t = $(n).attr("Data-RemoveUrl"),
        i = $(n).attr("Data-ProductGuid"),
        r = $(n).attr("data-RemoveWishlistMsg");
    RemoveFromWishList(t, "Add To Wish List", !1, i, r, n);
    $(n).attr("onclick", "AddToWishList(this)")
}

function wishlistNotification(n, t) {
    var r = $(n).offset(),
        u = $('[class*="wishlistCount"]:visible').offset(),
        i = (new Date).getTime();
    $("<div class='oneUpNotification badge badge-primary compareNotification' id='" + i + "'>+1<\/div>").appendTo("body");
    $("#" + i).css({
        top: r.top,
        left: r.left
    });
    $("#" + i).animate({
        top: u.top,
        left: u.left
    }, t - 250, "swing", function() {
        $("#" + i).fadeOut(250);
        setTimeout(function() {
            $("#" + i).remove()
        }, 250)
    })
}

function CallAddToWishList(n, t, i, r, u, f, e, o) {
    var s = {},
        h = {
            ProductGuid: r
        };
    s.url = n;
    s.type = "POST";
    s.data = JSON.stringify(h);
    s.contentType = "application/json;charset=utf-8";
    s.headers = {
        Accept: "text/html",
        WebSiteGuid: websiteguid,
        CookieDetails: cookiedetails,
        LanguageGuid: languageuid,
        CurrencyGuid: currencyguid,
        CampaignGuid: CampaignGuid
    };
    s.OnSuccess = function(n) {
        var t, r, i;
        $(".animsition-loading").hide();
        IsLoginWishListStatus = !0;
        $(u).addClass("is-addedin-wishlist");
        $(u).addClass("checked");
        t = $(u).find(".action-name").attr("data-remove-label");
        $(u).find(".action-name").text(t);
        $(u).attr("title", t);
        $(u).attr("data-original-title", t);
        r = u;
        i = 1e3;
        wishlistNotification(r, i);
        setTimeout(function() {
            var t = {},
                i = SaaS_Basket_Microservice_URL + "api/Wishlist/GetWishlistCountView";
            t.url = i;
            t.type = "GET";
            t.data = {};
            t.contentType = "application/json;charset=utf-8";
            t.headers = {
                Accept: "text/html",
                WebSiteGuid: websiteguid,
                CookieDetails: cookiedetails,
                LanguageGuid: languageuid,
                CurrencyGuid: currencyguid
            };
            t.OnSuccess = function(n) {
                $('div.saas-configurableelement[data-saaselementtype="WishList Count"]').html(n);
                var t = $('div.saas-configurableelement[data-saaselementtype="WishList Count"]').attr("data-render-target");
                typeof t != "undefined" && t != "" && t != null && $(t).html(n)
            };
            t.statusCode = {};
            t.OnError = function() {
                $(".animsition-loading").hide()
            };
            t.isAsync = !0;
            t.MicroserviceName = "SaaS_Basket_Microservice";
            callApi(t);
            n != "Product already added to wishlist" || popupV2({
                content: n,
                type: "warning"
            })
        }, i)
    };
    s.statusCode = {
        501: function() {
            IsLoginWishListStatus = !1;
            popupV2({
                content: f,
                actions: [{
                    text: e,
                    "do": function() {
                        var i, n, t, f;
                        for ($(u).addClass("wishlistchecked"), i = "", n = 0; window.location.pathname[n] === "/";) n++;
                        t = new Date;
                        t.setTime(t.getTime() + .25 * 864e5);
                        f = "expires=" + t.toGMTString();
                        document.cookie = "WishlistProductGuid=" + r + ";" + f + ";path=/";
                        i = window.location.pathname.substr(n);
                        window.location.replace(WebsiteURL + "Login?returnurl=" + i)
                    },
                    dismiss: !0
                }, ],
                type: o,
                close: function() {
                    $(u).hasClass("wishlistchecked") || ($(u).prop("checked", !1), $(u).removeClass("checked"), $(u).parent("label").removeClass("checked"))
                }
            })
        }
    };
    s.OnError = function() {
        $(".animsition-loading").hide()
    };
    s.isAsync = !1;
    s.MicroserviceName = "SaaS_Basket_Microservice";
    callApi(s)
}

function RemoveFromWishList(n, t, i, r, u, f) {
    $(".animsition-loading").show();
    var e = {},
        o = {
            ProductGuid: r
        };
    e.url = n + "/" + r;
    e.type = "POST";
    e.data = JSON.stringify(o);
    e.contentType = "application/json;charset=utf-8";
    e.headers = {
        Accept: "text/html",
        WebSiteGuid: websiteguid,
        CookieDetails: cookiedetails,
        LanguageGuid: languageuid,
        CurrencyGuid: currencyguid
    };
    e.OnSuccess = function() {
        var t, n, i;
        $(f).removeClass("is-addedin-wishlist");
        $(f).removeClass("checked");
        t = $(f).find(".action-name").attr("data-add-label");
        $(f).find(".action-name").text(t);
        $(f).attr("title", t);
        $(f).attr("data-original-title", t);
        n = {};
        i = SaaS_Basket_Microservice_URL + "api/Wishlist/GetWishlistCountView";
        n.url = i;
        n.type = "GET";
        n.data = {};
        n.contentType = "application/json;charset=utf-8";
        n.headers = {
            Accept: "text/html",
            WebSiteGuid: websiteguid,
            CookieDetails: cookiedetails,
            LanguageGuid: languageuid,
            CurrencyGuid: currencyguid
        };
        n.OnSuccess = function(n) {
            $(".animsition-loading").hide();
            $('div.saas-configurableelement[data-saaselementtype="WishList Count"]').html(n);
            var t = $('div.saas-configurableelement[data-saaselementtype="WishList Count"]').attr("data-render-target");
            typeof t != "undefined" && t != "" && t != null && $(t).html(n)
        };
        n.statusCode = {};
        n.OnError = function() {
            $(".animsition-loading").hide()
        };
        n.isAsync = !1;
        n.MicroserviceName = "SaaS_Basket_Microservice";
        callApi(n)
    };
    e.statusCode = {};
    e.OnError = function() {};
    e.isAsync = !1;
    e.MicroserviceName = "SaaS_Basket_Microservice";
    callApi(e)
}

function GetQuickViewPopup(n) {
    var t = $(n).attr("Data-ActionUrl");
    GetQuickViewToModel(t, "Quick View", !1)
}

function GetQuickViewToModel(n, t) {
    var r = n,
        i = {};
    i.url = r;
    i.type = "GET";
    i.data = {};
    i.headers = {
        WebSiteGuid: $("#hdnWebsiteGuid").val(),
        LanguageGuid: $("#hdnLanguageGuid").val(),
        CurrencyGuid: currencyguid,
        CookieDetails: cookiedetails
    };
    i.dataType = "HTML";
    i.OnSuccess = function(n) {
        popupV2({
            content: n,
            title: t,
            size: "lg",
            classes: "quickViewPopup"
        })
    };
    i.statusCode = {};
    i.OnError = function() {};
    i.isAsync = !1;
    i.MicroserviceName = "SaaS_Product_Microservice";
    i.contentType = "application/json;charset=utf-8";
    callApi(i)
}
var Msgcommonok = "OK",
    MsgCommanconfirm = "confirm",
    IsLoginWishListStatus = !1;
$(function() {
    $(document).on("change", ".chkWishlist", function() {
        $(this)[0].checked ? ($(this).addClass("checked"), $(this).parent("label").addClass("checked")) : ($(this).removeClass("checked"), $(this).parent("label").removeClass("checked"))
    });
    $(document).on("change", '.wishlistcard input[type="checkbox"]', function() {
        var n = this;
        if ($(n).is(":checked")) {
            var t = $(n).attr("Data-ActionUrl"),
                i = $(n).attr("Data-ProductGuid"),
                r = $(n).attr("data-message"),
                u = $(n).attr("data-Removewishlist");
            CallAddToWishList(t, "Add To Wish List", !1, i, n, r, Msgcommonok, MsgCommanconfirm);
            IsLoginWishListStatus && $(n).next("span").text(u)
        } else {
            var t = $(n).attr("Data-RemoveUrl"),
                i = $(n).attr("Data-ProductGuid"),
                f = $(n).attr("data-RemoveWishlistMsg"),
                e = $(n).attr("data-wishlistmsg");
            RemoveFromWishList(t, "Add To Wish List", !1, i, f, n);
            $(n).next("span").text(e)
        }
    })
});
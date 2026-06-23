setTimeout(function () { initTypeahead(); }, 300);
$(document).on('change', '#drdSearchCategory', function () {
    initTypeahead();
});
$(document).on('change', '#drdSearchPricing', function () {
    initTypeahead();
});
$(document).on("click", ".IsredirectLi", function () {
    let categoriesGuid = $(this).attr("data-collection-guid");
    let aliasName = $(this).attr("data-alias-name");
    $("#hdnLiCategoriesGuid").val(categoriesGuid);
    $("#hdnLiCategoriesGuid").attr("data-alias-name", aliasName);
    initTypeahead();
});
var isSearch = false;
var respons = false;
var SearchText = "";

var CorrectText = "";
var Productdata = "";
var SearchTextbox = "";


$(document).on('keyup', '.SearchtextBox', function (e) {
    SearchText = $(this).val().trim();
    if (e.keyCode != 13 && e.keyCode != 40)
    {
        respons = SearchText.length >= SearchTextBoxJS ? true : false;
    }
    //else {
    //    if (SearchText.length >= 2) {
    //        respons = true;
    //        RedirectToListPage();
    //    }
    //}
});
function initTypeahead() {

    $(".SearchtextBox").typeahead('destroy');
    $(".search-wrap").removeClass("init");

    setInterval(function () {
        var searchtext = $(".search-wrap:visible").find("#txtKeyword").val();
        if (searchtext !== "" && searchtext !== "undefined") {
            if ($.trim(searchtext)) {
                var regex = /(<([^>]+)>)/ig;
                searchtext = searchtext.replace(regex, "");
                $(".search-wrap:visible").find("#txtKeyword").val(searchtext);

                var result = $(".search-wrap:visible").find(".tt-hint").val();
                result = result.replace(regex, "");
                $(".search-wrap:visible").find(".tt-hint").val(result);
            }
        }

    }, 20);

    $(".search-wrap").not('.init').each(function () {       
        $(this).addClass("init");
        var stbox = $(this).find(".SearchtextBox");
        var drdSearchCategory = $("#lblSpanSearchName").length == 0 ? $(this).find(".drdSearchCategory") : $("#hdnLiCategoriesGuid");
        var drdSearchPricing = $("#drdSearchPricing");
        if (typeof drdSearchPricing == "undefined" || typeof $(drdSearchPricing).val() == "undefined" || $(drdSearchPricing).val() == "" || $(drdSearchPricing).val() == null) {
            if ($(".searchPriceWrap:visible").find("#drdSearchPricing").length > 0)
                drdSearchPricing = typeof $(".searchPriceWrap:visible").find("#drdSearchPricing").val() === "undefined" || $(".searchPriceWrap:visible").find("#drdSearchPricing").length === 0 ? "" : $(".searchPriceWrap:visible").find("#drdSearchPricing");
        }
        var isShowImageOnSearch = false;
        var isShowImageOnSearch = $('div [data-saaselementtype="Search"]').attr('data-showImageOnSearch');
        if (typeof isShowImageOnSearch != "undefined" && isShowImageOnSearch != "" && isShowImageOnSearch != "false") {
            isShowImageOnSearch = true;
        }       

        $("#searchinput").html('<input type="text" class="keywordSearch" id="txtKeyword" placeholder="Search"  onkeydown="SetFocusOnButton(event,btnSearchMaster)"/>');
        var productsearcher = new Bloodhound({
            datumTokenizer: function (d) {
                return Bloodhound.tokenizers.whitespace('ProductName');
            },
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            replace: function (url, uriEncodedQuery) {
                return url + "#" + uriEncodedQuery;
                // the part after the hash is not sent to the server
            },
            remote: {
                url: SaaS_ProductListing_Microservice_URL + 'api/Products/GetSearchResultsUsingCodeExpression?categoryGuid=' + (typeof $(drdSearchCategory).val() === "undefined" ? '' : $(drdSearchCategory).val() == "all" ? '' : $(drdSearchCategory).val()) + '&Keyword=%QUERY&PricingRange=' + (typeof $(drdSearchPricing).val() === "undefined" ? '' : $(drdSearchPricing).val() == "all" ? '' : $(drdSearchPricing).val()) + '&isShowImageOnSearch=' + isShowImageOnSearch ,
                prepare: function (query, settings) {
                    settings.url = settings.url.replace('%QUERY', query);
                    settings.headers = {
                        'WebsiteGuid': websiteGuid,
                        'LanguageGuid': languageGuid,
                        'currencyguid': currencyguid,
                        'Authorization': 'Bearer ' + tokens.SaaS_Product_Microservice_Token,
                        "CookieDetails": cookiedetails
                    };
                    return settings;
                },
                wildcard: '%QUERY'
            }
        });

        var promise = productsearcher.initialize();

        promise
            .done(function () { console.log('initialize'); setTimeout(function () { $('.twitter-typeahead.flex-g input').attr('autocomplete', 'off'); }, 100); })


        var dispColName = 'ProductName';
        var IsDisplayWithProdCode = $('div [data-saaselementtype="Search"]').attr('data-showproductcode');
      
        if (typeof IsDisplayWithProdCode !== typeof undefined && IsDisplayWithProdCode !== "false") {
            dispColName = 'ProductNameWithCode';
        }

        stbox.typeahead({
            hint: true,
            highlight: true,
            minLength: SearchTextBoxJS
        },
            {
                displayKey: dispColName,
                rateLimitWait: 500,
                limit: 20,
                source: productsearcher.ttAdapter()
            }).bind("typeahead:selected", function (obj, datum, name) {
                
                var isCamelioneLikeShowVariantSize = $("#hdnChemeleonLikeEnable").val();
                if (isCamelioneLikeShowVariantSize.toLowerCase() == "false") {
                    if (typeof $(drdSearchCategory).val() === "undefined" || $(drdSearchCategory).val() === "") {
                        SetCookie("CategoryGuid", "");
                        if (datum.ProductAliasName == "" || datum.ProductAliasName == null) {
                            window.location = location.protocol + '//' + window.location.host + '/product/' + datum.EncodedProductName.trim().toLowerCase() + '/' + datum.ProductCode.trim();
                        }
                        else {
                            window.location = location.protocol + '//' + window.location.host + '/product/' + datum.ProductAliasName.trim().toLowerCase();
                        }
                    }
                    else {
                        if (datum.ProductAliasName == "" || datum.ProductAliasName == null) {
                            window.location = location.protocol + '//' + window.location.host + '/product/' + datum.EncodedProductName.trim().toLowerCase() + '/' + datum.ProductCode.trim();
                        }
                        else {
                            window.location = location.protocol + '//' + window.location.host + '/product/' + datum.ProductAliasName.trim().toLowerCase();
                        }
                    }
                }
                else {

                    if (typeof $(drdSearchCategory).val() === "undefined" || $(drdSearchCategory).val() === "") {
                        if (datum.ProductAliasName == "" || datum.ProductAliasName == null) {
                            window.location = location.protocol + '//' + window.location.host + '/product/' + datum.EncodedProductName.trim().toLowerCase() + '/' + datum.ProductCode.trim() + '/' + SearchText;
                        }
                        else {
                            window.location = location.protocol + '//' + window.location.host + '/product/' + datum.ProductAliasName.trim().toLowerCase() + '/' + SearchText;
                        }
                    }
                    else {
                        if (datum.ProductAliasName == "" || datum.ProductAliasName == null) {
                            window.location = location.protocol + '//' + window.location.host + '/product/' + datum.EncodedProductName.trim().toLowerCase() + '/' + datum.ProductCode.trim() + '/' + SearchText;
                        }
                        else {
                            window.location = location.protocol + '//' + window.location.host + '/product/' + datum.ProductAliasName.trim().toLowerCase() + '/' + SearchText;
                        }
                    }
                }
            }).bind("typeahead:asyncreceive", function (ev, datum) {
                respons = true;
                //if (isSearch) {
                //    RedirectToDetailsPageFromSearch();
                //}
                $(".tt-suggestion").each(function () {
                    $(this).html($(this).text());
                })
            });
        $(".search-wrap .twitter-typeahead").addClass("flex-g");
    });
}

function EncodeName(Name) {
    //
    Name = replaceAll(Name, ".", "-dot-");
    Name = replaceAll(Name, "'", "-quote-");
    Name = replaceAll(Name, "&", "-and-");
    Name = replaceAll(Name, "+", "-plus-");
    Name = replaceAll(Name, "/", "-slash-");
    Name = replaceAll(Name, "\"", "-dbq-");
    Name = replaceAll(Name, "*", "-star-");
    Name = replaceAll(Name, "<", "-lt-");
    Name = replaceAll(Name, ">", "-gt-");
    Name = replaceAll(Name, ":", "-col-");
    Name = replaceAll(Name, "#", "-hash-");
    Name = replaceAll(Name, "%", "-per-");
    Name = replaceAll(Name, " ", "-space-");
    Name = replaceAll(Name, "®", "-reg-");
    Name = replaceAll(Name, "™", "-trade-");
    Name = replaceAll(Name, "©", "-copy-");
    Name = replaceAll(Name, "”", "-rdqm-");
    return Name;
}

function RedirectToListPage() {
    var Searchlenth = parseInt($('.tt-daseatt').children().length);
    if (Searchlenth == 0) {
        isSearch = true;
        if (respons) {
            if (isEwizAiFeatureEnabled.toLowerCase() == "true" && AiWebsiteGuid != "") {
                SaveSearchVolumes();
            }
            RedirectToDetailsPageFromSearch();
        }
        else {
            //Setting Based for Search Based Price
            var SearchBasedPriceData = $('[data-saaselementtype="Search"]').attr('data-ShowSearchPriceBased');
            if (SearchBasedPriceData == undefined || SearchBasedPriceData == null || SearchBasedPriceData == "" || SearchBasedPriceData == 'undefined' || SearchBasedPriceData == 'null') {
                SearchBasedPriceData = "false";
            }
            if (SearchBasedPriceData.toLowerCase() == "true") {
                RedirectSearchPricedBased();
            }
        }
    }
    else {
        RedirectToDetailsPageFromSearch();
    }
}

function RedirectSearchPricedBased() {
    var SearchPricing = $("#drdSearchPricing option:selected").val();
    if (typeof SearchPricing !== "undefined" && SearchPricing !== "") {
        if (SearchPricing.indexOf("-") >= 0) {
            var Price = SearchPricing.split('-');
            if (Price.length > 0) {
                var MinPrice = Price[0];
                var MaxPrice = Price[1];
            }
        }
        if (SearchPricing.indexOf("-") >= 0) {// window.location = location.protocol + '//' + window.location.host + '/product/search/' + EncodeName(keyword.trim().toLowerCase().replace(" and ", " & ")) + '/' + MinPrice + '/' + MaxPrice;
            //GetProductWithQueryString();
            window.location = window.location.origin + '/product/index?PageView=grid&Filter=true&IsPriceSliderSlides=1&Ap=' + MinPrice + '|' + MaxPrice + '&Price=' + MinPrice + '|' + MaxPrice + '&PriceFromDrown=true';
        }
    }
}

function RedirectToDetailsPageFromSearch() {
    //respons = false;
    isSearch = false;
    var keyword = SearchText;// $("#txtKeyword").val();
    var categoryAliasName = $("#lblSpanSearchName").length == 0 ? $("#drdSearchCategory option:selected").attr('data-alias-name') :
        $("#hdnLiCategoriesGuid").attr("data-alias-name"); //$("#drdSearchCategory").val();

    categoryAliasName = categoryAliasName == "all" ? "" : categoryAliasName;
    var SearchPricing = $("#drdSearchPricing").val();
    if (typeof SearchPricing == "undefined" || SearchPricing == "" || SearchPricing == null) {
        if($(".searchPriceWrap:visible").find("#drdSearchPricing").length > 0)
          SearchPricing = typeof $(".searchPriceWrap:visible").find("#drdSearchPricing").val() === "undefined" || $(".searchPriceWrap:visible").find("#drdSearchPricing").val() === "" ? "" : $(".searchPriceWrap:visible").find("#drdSearchPricing").val();
    }
    SearchPricing = SearchPricing == "all prices" ? "" : SearchPricing;
    if (keyword.trim().length < 1) {
       //popupV2({ content: MinimumCharactersRequiredForSearch, type: 'warning' });
    }
    else {
        var Searchlnth = parseInt($('.tt-dataset').children().length);
        if (Searchlnth <= 0 && (typeof categoryAliasName === "undefined" || categoryAliasName === "") && (typeof SearchPricing === "undefined" || SearchPricing === "")) {
            if (IsSpellcheck == "True") {
                checkWord(keyword, categoryAliasName, SearchPricing);
                if (Productdata == "" || Productdata.length < 0) {
                    GetcorrectWord(keyword);
                    if (CorrectText != "") {
                        keyword = CorrectText;
                        IsSpellCheck = "true";
                        window.location = location.protocol + '//' + window.location.host + '/product/searchspell/' + EncodeName(keyword.trim().toLowerCase()) + "/" + IsSpellCheck;
                    }
                    else {
                        window.location = location.protocol + '//' + window.location.host + '/product/search/' + EncodeName(keyword.trim().toLowerCase().replace(" and ", " & "));

                    }

                }
                else {
                    if (((Productdata[0].ProductName).toLowerCase()).indexOf(keyword.toLowerCase()) >= 0 || (Productdata[0].ProductCode).toLowerCase().indexOf(keyword.toLowerCase()) >= 0) {
                        window.location = location.protocol + '//' + window.location.host + '/product/search/' + EncodeName(keyword.trim().toLowerCase().replace(" and ", " & "));
                    }
                    else {
                        IsSpellCheck = "true";
                        window.location = location.protocol + '//' + window.location.host + '/product/searchspell/' + EncodeName(keyword.trim().toLowerCase()) + "/" + IsSpellCheck;
                    }
                }
            }
            else {
                window.location = location.protocol + '//' + window.location.host + '/product/search/' + EncodeName(keyword.trim().toLowerCase().replace(" and ", " & "));
            }
            //popupV2({ content: 'No products found', type: 'warning', title: 'Alert' });
            //return false;

        }
        else if (Searchlnth <= 0 && (typeof categoryAliasName != "undefined" || categoryAliasName != "") && (typeof SearchPricing === "undefined" || SearchPricing === "")) {
            if (IsSpellcheck == "True") {
                drdSearchPricing = $("#drdSearchPricing");
                checkWord(keyword, categoryAliasName.toLowerCase(), SearchPricing);
                if (Productdata == "" || Productdata.length < 0) {
                    GetcorrectWord(keyword);
                    if (CorrectText != "") {
                        keyword = CorrectText;
                        IsSpellCheck = "true";
                        window.location = location.protocol + '//' + window.location.host + '/product/searchspell/' + EncodeName(keyword.trim().toLowerCase()) + '/' + categoryAliasName.toLowerCase() + "/" + IsSpellCheck;
                    }
                    else {
                        window.location = location.protocol + '//' + window.location.host + '/product/search/' + EncodeName(keyword.trim().toLowerCase().replace(" and ", " & ")) + '/' + categoryAliasName.toLowerCase();
                    }
                }
                else {
                    window.location = location.protocol + '//' + window.location.host + '/product/search/' + EncodeName(keyword.trim().toLowerCase().replace(" and ", " & ")) + '/' + categoryAliasName.toLowerCase();
                }
            }
            else {
                window.location = location.protocol + '//' + window.location.host + '/product/search/' + EncodeName(keyword.trim().toLowerCase().replace(" and ", " & ")) + '/' + categoryAliasName.toLowerCase();
            }
        }
        else if (Searchlnth === 1) {
            $('.tt-selectable').first().click();
        }
        else {
            if (typeof SearchPricing !== "undefined" && SearchPricing !== "") {
                if (SearchPricing.indexOf("-") >= 0) {
                    var Price = SearchPricing.split('-');
                    if (Price.length > 0) {
                        var MinPrice = Price[0];
                        var MaxPrice = Price[1];
                    }
                }
            }
            if ((typeof categoryAliasName === "undefined" || categoryAliasName === "") && (typeof SearchPricing === "undefined" || SearchPricing === "")) {
                window.location = location.protocol + '//' + window.location.host + '/product/search/' + EncodeName(keyword.trim().toLowerCase().replace(" and ", " & "));
            }
            else if ((typeof categoryAliasName != "undefined" || categoryAliasName != "") && (typeof SearchPricing === "undefined" || SearchPricing === "")) {
                window.location = location.protocol + '//' + window.location.host + '/product/search/' + EncodeName(keyword.trim().toLowerCase().replace(" and ", " & ")) + '/' + categoryAliasName.toLowerCase();
            }
            else if ((typeof categoryAliasName !== "undefined" && categoryAliasName !== "") && (typeof SearchPricing !== "undefined" && SearchPricing !== "")) {
                if (SearchPricing.indexOf("-") >= 0) {
                    window.location = location.protocol + '//' + window.location.host + '/product/search/' + EncodeName(keyword.trim().toLowerCase().replace(" and ", " & ")) + '/' + categoryAliasName.toLowerCase() + '/' + MinPrice + '/' + MaxPrice;
                }
            }
            else if ((typeof categoryAliasName === "undefined" || categoryAliasName === "") && (typeof SearchPricing !== "undefined" && SearchPricing !== "")) {
                if (SearchPricing.indexOf("-") >= 0) {
                    window.location = location.protocol + '//' + window.location.host + '/product/search/' + EncodeName(keyword.trim().toLowerCase().replace(" and ", " & ")) + '/' + MinPrice + '/' + MaxPrice;
                }

            }
        }
    }
}


function replaceAll(string, find, replace) {
    return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function GetcorrectWord(str) {
    var url = productapi + 'api/Products/SpellCheck/' + str;

    var objAjax = {};
    objAjax.url = url;
    objAjax.type = 'POST';
    objAjax.data = {};
    objAjax.headers = {};
    objAjax.OnSuccess = function (data) {
        var result = JSON.parse(data);

        if (Object.keys(result.corrections).length > 0) {
            CorrectText = result.suggestion;
        }
        else {
            CorrectText = "";
        }
    };
    objAjax.statusCode = {

    };
    objAjax.OnError = function (msg) {
    };
    objAjax.isAsync = false;
    objAjax.MicroserviceName = 'SaaS_Product_Microservice';
    objAjax.contentType = 'application/json;charset=utf-8';
    callApi(objAjax);
}

function checkWord(keyword, category, PricingRange) {
    var url = SaaS_ProductListing_Microservice_URL + 'api/Products/GetSearchResultsUsingCodeExpression?categoryGuid=' + ((category == undefined) ? '' : category) + '&PricingRange=' + ((PricingRange == undefined) ? '' : PricingRange) + '&Keyword=' + keyword;

    var objAjax = {};
    objAjax.url = url;
    objAjax.type = 'GET';
    objAjax.data = {};
    objAjax.headers = {
        'WebsiteGuid': websiteGuid,
        'LanguageGuid': languageGuid,
        'currencyguid': currencyguid,
        "CookieDetails": cookiedetails
    };
    objAjax.OnSuccess = function (data) {
        if (data != "") {
            Productdata = JSON.parse(data);
        }
    };
    objAjax.statusCode = {

    };
    objAjax.OnError = function (msg) {
    };
    objAjax.isAsync = false;
    objAjax.MicroserviceName = 'SaaS_ProductListing_Microservice';
    objAjax.contentType = 'application/json;charset=utf-8';
    callApi(objAjax);
}

//below code is added by James to save search keyword in EwizAi
function SaveSearchVolumes() {
    var url = SaaS_ProductListing_Microservice_URL + 'api/Products/SaveSearchVolumes' + "/" + SearchText + "/" + AiWebsiteGuid;

    var objAjax = {};
    objAjax.url = url;
    objAjax.type = 'POST';
    objAjax.data = {};
    objAjax.headers = {};
    objAjax.OnSuccess = function (data) {

    };
    objAjax.statusCode = {

    };
    objAjax.OnError = function (msg) {
    };
    objAjax.isAsync = true;
    objAjax.MicroserviceName = 'SaaS_ProductListing_Microservice';
    objAjax.contentType = 'application/json;charset=utf-8';
    callApi(objAjax);
}
//ends here



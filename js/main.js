window.onload = function () {
    //    公共方法库
    var MyLib = {
        getObj: {
            getElem: function (selector, elem) {
                return elem ? elem.querySelector(selector) : document.querySelector(selector);

            },
            getAllElem: function (selectors, elem) {
                return elem ? elem.querySelectorAll(selectors) : document.querySelectorAll(selectors);
            },
        },
        cookieMether: {
            /*设置cookie,设置时间单位是天*/
            setCookie: function (name, value, d) {
                var date = new Date();
                date.setTime(date.getTime() + (d * 24 * 60 * 60 * 1000));
                document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + ";expires=" + date.toGMTString();
            },
            /*设置获取cookie*/
            getCookie: function (name) {
                var list = document.cookie.split(";");
                for (var i = 0; i < list.length; i++) {
                    var item = list[i].split("=");
                    if (item[0].replace(/(^\s*)|(\s*$)/g, "") === name) {
                        return encodeURIComponent(item[1]);
                    }
                }
            },
            /*设置删除cookie*/
            removeCookie: function (name) {
                this.setCookie(name, "", -1);
            },
        },
        /*获取元素的最终style（兼容IE6、7、8）*/
        getStyle: function (obj, attr) {
            var result = ""
            if (obj.currentStyle) {
                result = obj.currentStyle[attr];
            } else {
                result = getComputedStyle(obj)[attr];
            }
            result = attr == 'opacity' ? Math.round(parseFloat(result) * 100) : parseInt(result);
            return result;
        },
        classMether: {
            hasClass: function (elem, cls) {
                return elem.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
            },
            removeClass: function (elem, cls) {
                var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
                elem.className = elem.className.replace(reg, ' ');
            },
            addClass: function (elem, cls) {
                elem.className += this.hasClass(elem, cls) ? '' : ' ' + cls;
            },
        },
        getData: function (url, callback, options) {
            var xhr = new XMLHttpRequest();
            //            请求参数序列化
            function serialize(data) {
                if (!data) return '';
                var pairs = [];
                for (var name in data) {
                    if (!data.hasOwnProperty(name)) continue;
                    if (typeof data[name] === 'function') continue;
                    var value = data[name].toString();
                    name = encodeURIComponent(name);
                    value = encodeURIComponent(value);
                    pairs.push(name + '=' + value);
                }
                return pairs.join('&');
            }
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
                        callback(xhr.responseText);
                    } else {
                        alert("request failed:" + xhr.status);
                    }
                }
            }
            xhr.open("get", url + "?" + serialize(options), true);
            xhr.send(null);
        },
        inherit: {
            inheritObject: function (o) {
                function F() {};
                F.prototype = o;
                return new F();
            },
            inheritPrototype: function (subClass, superClass) {
                var p = this.inheritObject(superClass.prototype);
                p.constructor = subClass;
                subClass.prototype = p;
            }
        },
    };

    function Slider(selector) {
        this.container = MyLib.getObj.getElem(selector);
        this.imgs = MyLib.getObj.getAllElem(".c-slider__item", this.container);
        this.btns = MyLib.getObj.getAllElem(".c-pointer__btn", this.container);
        this.cur = 0;
        this.init();
    }


    Slider.prototype.init = function () {
        this.timer = setInterval(this.autoPlay.bind(this), 3000);
        this.hover();
        this.clickBtn();
    }

    Slider.prototype.clickBtn = function () {
        for (var i = 0; i < this.btns.length; i++) {
            this.btns[i].index = i;
            var _this = this;
            this.btns[i].onclick = function () {
                _this.cur = this.index;
                _this.switchImg();
            }
        }
    }

    Slider.prototype.switchImg = function () {
        for (var i = 0; i < this.btns.length; i++) {
            MyLib.classMether.removeClass(this.btns[i], "c-pointer__btn--active");
        };
        MyLib.classMether.addClass(this.btns[this.cur], "c-pointer__btn--active");
        for (var j = 0; j < this.imgs.length; j++) {
            this.animateImg(this.imgs[j], 0);
        }
        this.animateImg(this.imgs[this.cur], 100);

    }

    Slider.prototype.animateImg = function (elem, target) {
        var curopacity = 0;
        clearInterval(elem.timer);
        elem.timer = setInterval(function () {
            curopacity = MyLib.getStyle(elem, "opacity");
            var speed = 0;
            if (curopacity > target) {
                speed = -5;
            } else if (curopacity < target) {
                speed = 5;
            };
            if (curopacity == target) {
                clearInterval(elem.timer);
            } else {
                curopacity += speed;
                elem.style.opacity = curopacity / 100;
                elem.style.filter = 'alpha(opacity:' + curopacity + ')';
            };
        }, 30);

    }

    Slider.prototype.hover = function () {
        var _this = this;
        this.container.onmouseenter = function () {
            clearInterval(_this.timer);
        };
        this.container.onmouseleave = function () {
            _this.timer = setInterval(_this.autoPlay.bind(_this), 3000);
        }
    }

    Slider.prototype.autoPlay = function () {
        if (this.cur == this.imgs.length - 1) {
            this.cur = 0;
        } else {
            this.cur++;
        };
        this.switchImg();
    }

    new Slider(".c-slider");

    function loadDesignCourse(selector) {
        this.container = MyLib.getObj.getElem(selector);
        this.courseList = MyLib.getObj.getElem(".l-list", this.container);
        this.pageContent = MyLib.getObj.getElem(".c-page__content", this.container);
        this.prevBtn = MyLib.getObj.getElem(".c-page__prev", this.container);
        this.nextBtn = MyLib.getObj.getElem(".c-page__next", this.container);
        this.url = 'http://study.163.com/webDev/couresByCategory.htm';
        this.parameter = {
            pageNo: 1,
            psize: 20,
            type: 10,
        };
        this.init();
    }

    loadDesignCourse.prototype.init = function () {
        MyLib.getData(this.url, this.insertData.bind(this), this.parameter);
        this.changePage();
    }

    loadDesignCourse.prototype.insertData = function (data) {
        this.courseList.innerHTML = "";
        this.pageContent.innerHTML = "";
        var data = JSON.parse(data);
        for (var i = 0; i < data.list.length; i++) {
            if (!data.list[i].price) {
                data.list[i].price = "免费";
            } else {
                data.list[i].price = "￥" + data.list[i].price;
            }
            if (!data.list[i].categoryName) {
                data.list[i].categoryName = "暂无分类";
            }
            var list = `<li class = \"l-list__item\">
                <div class=\"c-card\">
                    <div class=\"c-card__imgwrap\">
                        <img src = ` + data.list[i].middlePhotoUrl + ` class=\"c-card__img\">
                    </div>
                    <h3 class=\"c-card__title\">` + data.list[i].name + `</h3>
                    <span class=\"c-card__provider\">` + data.list[i].provider + `</span>
                    <span class=\"c-card__count\">` + data.list[i].learnerCount + `人学过</span>
                    <span class=\"c-card__price\">` + data.list[i].price + `</span>
                </div>
                <div class=\"c-bigcard\">
                    <div class=\"c-bigcard__imgwrap\">
                        <img src=` + data.list[i].middlePhotoUrl + ` class=\"c-bigcard__img\">
                    </div>
                    <div class=\"c-bigcard__content u-clearfix\">
                        <h3 class=\"c-bigcard__title\">` + data.list[i].name + `</h3>
                        <span class=\"c-bigcard__count\">` + data.list[i].learnerCount + `人在学</span>
                        <span class=\"c-bigcard__provider\">发布者：` + data.list[i].provider + `</span>
                        <span class=\"c-bigcard__category\"> 分类：` + data.list[i].categoryName + `</span>
                    </div>
                    <p class=\"c-bigcard__desc\">` + data.list[i].description + `</p> </div> </li>`;
            this.courseList.innerHTML += list;
        }
        this.totalPage = data.totalPage;
        for (var j = 1; j < this.totalPage + 1; j++) {
            var page = `<span class=\"c-page__item\">` + j + `</span>`;
            this.pageContent.innerHTML += page;
        }
        this.pageBtn = MyLib.getObj.getAllElem(".c-page__item", this.pageContent);
        MyLib.classMether.addClass(this.pageBtn[this.parameter.pageNo - 1], "c-page__item--active");

        this.clickPage();
    }

    loadDesignCourse.prototype.clickPage = function () {
        for (var i = 0; i < this.pageBtn.length; i++) {
            this.pageBtn[i].index = i;
            var _this = this;
            this.pageBtn[i].onclick = function () {
                MyLib.classMether.removeClass(_this.pageBtn[_this.parameter.pageNo - 1], "c-page__item--active");
                _this.parameter.pageNo = this.index + 1;
                MyLib.classMether.addClass(_this.pageBtn[_this.parameter.pageNo - 1], "c-page__item--active");
                MyLib.getData(_this.url, _this.insertData.bind(_this), _this.parameter);
            }
        }
    }

    loadDesignCourse.prototype.changePage = function () {
        var _this = this;
        this.prevBtn.onclick = function () {
            if (_this.parameter.pageNo > 1) {
                MyLib.classMether.removeClass(_this.pageBtn[_this.parameter.pageNo - 1], "c-page__item--active");
                _this.parameter.pageNo--;
                MyLib.classMether.addClass(_this.pageBtn[_this.parameter.pageNo - 1], "c-page__item--active");
                MyLib.getData(_this.url, _this.insertData.bind(_this), _this.parameter);
            }
        }
        this.nextBtn.onclick = function () {
            if (_this.parameter.pageNo < _this.totalPage) {
                MyLib.classMether.removeClass(_this.pageBtn[_this.parameter.pageNo - 1], "c-page__item--active");
                _this.parameter.pageNo++;
                MyLib.classMether.addClass(_this.pageBtn[_this.parameter.pageNo - 1], "c-page__item--active");
                MyLib.getData(_this.url, _this.insertData.bind(_this), _this.parameter);
            }
        }
    }

    new loadDesignCourse(".l-design");


    function loadCodeCourse(selector) {
        loadDesignCourse.call(this, selector);
        this.parameter = {
            pageNo: 1,
            psize: 20,
            type: 20,
        }
    }

    MyLib.inherit.inheritPrototype(loadCodeCourse, loadDesignCourse);


    function courseType() {
        this.designBtn = MyLib.getObj.getElem(".js-designBtn");
        this.codeBtn = MyLib.getObj.getElem(".js-codeBtn");
        this.designBox = MyLib.getObj.getElem(".l-design");
        this.codeBox = MyLib.getObj.getElem(".l-code");
        this.canload = true;
        this.bind();

    }

    courseType.prototype.bind = function () {
        this.clickDesignBtn();
        this.clickCodeBtn();
    }

    courseType.prototype.clickDesignBtn = function () {
        var _this = this;
        this.designBtn.onclick = function () {
            MyLib.classMether.removeClass(_this.codeBtn, "c-course__btn--active");
            MyLib.classMether.addClass(_this.designBtn, "c-course__btn--active");
            MyLib.classMether.removeClass(_this.designBox, "l-hidden");
            MyLib.classMether.addClass(_this.codeBox, "l-hidden");
        }
    }

    courseType.prototype.clickCodeBtn = function () {
        var _this = this;
        this.codeBtn.onclick = function () {
            MyLib.classMether.removeClass(_this.designBtn, "c-course__btn--active");
            MyLib.classMether.addClass(_this.codeBtn, "c-course__btn--active");
            MyLib.classMether.removeClass(_this.codeBox, "l-hidden");
            MyLib.classMether.addClass(_this.designBox, "l-hidden");
            if (_this.canload) {
                new loadCodeCourse(".l-code");
                _this.canload = false;
            }
        }
    }

    new courseType();

    function loadSideBar() {
        this.topList = MyLib.getObj.getElem(".l-top");

        this.url = 'http://study.163.com/webDev/hotcouresByCategory.htm';
        this.init();
    }

    loadSideBar.prototype.init = function () {
        MyLib.getData(this.url, this.insertData.bind(this));
        this.autoScroll();
    }

    loadSideBar.prototype.insertData = function (data) {
        var data = JSON.parse(data);
        for (var i = 0; i < data.length; i++) {
            var list = `<li class=\"c-topcard\">
                <div class=\"c-topcard__imgwrap\">
                    <img src=` + data[i].smallPhotoUrl + ` alt=\"hot\" class=\"c-topcard__img\">
                </div>
                <div class=\"c-topcard__content\">
                    <span class=\"c-topcard__title\">` + data[i].name + `</span>
                    <span class=\"c-topcard__count\">` + data[i].learnerCount + `人学过</span>
                </div>
            </li>`;
            this.topList.innerHTML += list;
        }
    }

    loadSideBar.prototype.animateScroll = function () {
        var i = 0,
            _this = this;
        var timer = setInterval(function () {
            if (5 * i > 70) {
                clearInterval(timer);
            }
            _this.topList.style.top = parseFloat(MyLib.getStyle(_this.topList, "top")) - 5 + "px";
            i++;
        }, 30);
    }

    loadSideBar.prototype.autoScroll = function () {
        var _this = this;
        this.timer = setInterval(this.scroll.bind(this), 3000);
        this.topList.onmouseenter = function () {
            clearInterval(_this.timer);
        };
        this.topList.onmouseleave = function () {
            _this.timer = setInterval(_this.scroll.bind(_this), 2000)
        }
    }

    loadSideBar.prototype.scroll = function () {
        var _this = this;
        if (parseFloat(MyLib.getStyle(this.topList, "top")) < -700) {
            var timer = setInterval(function () {
                if (parseFloat(MyLib.getStyle(_this.topList, "top")) >= 0) {
                    clearInterval(timer);
                }
                _this.topList.style.top = parseFloat(MyLib.getStyle(_this.topList, "top")) + 20 + "px";

            }, 30);
        }
        this.animateScroll();
    }

    new loadSideBar();

    function videoPlay() {
        this.poster = MyLib.getObj.getElem(".c-org__img");
        this.videoPanel = MyLib.getObj.getElem(".l-video");
        this.closeBtn = MyLib.getObj.getElem(".c-video__closebtn");
        this.bind();
    }

    videoPlay.prototype.bind = function () {
        var _this = this;
        this.poster.onclick = function () {
            _this.videoPanel.style.display = "block";
        };
        this.closeBtn.onclick = function () {
            _this.videoPanel.style.display = "none";
        }
    }

    new videoPlay();

    function login() {
        this.loginPanel = MyLib.getObj.getElem(".l-login");

        this.closeBtn = MyLib.getObj.getElem(".c-login__closebtn", this.loginPanel);
        this.submitBtn = MyLib.getObj.getElem(".c-login__submitbtn", this.loginPanel);

        this.followBtn = MyLib.getObj.getElem(".c-followbtn");
        this.cancleBtn = MyLib.getObj.getElem(".c-canclebtn");
        this.init();
    }

    login.prototype.init = function () {
        this.onloadWindow();
        this.clickCloseBtn();
        this.clickSubmitBtn();
        this.clickCancleBtn();
    }

    login.prototype.clickCancleBtn = function () {
        var _this = this;
        this.cancleBtn.onclick = function () {
            MyLib.cookieMether.removeCookie("followSuc");
            
            this.style.display = "none";
            _this.followBtn.disabled = false;
            _this.followBtn.value = "+关注";
        }
    }

    login.prototype.onloadWindow = function () {
        var _this = this;
        if (MyLib.cookieMether.getCookie("loginSuc")) {
            if (MyLib.cookieMether.getCookie("followSuc")) {
                this.followSuccess();
            } else {
                this.followBtn.onclick = function () {
                    _this.followSuccess();
                }
            }

        } else {
            this.followBtn.onclick = function () {
                _this.loginPanel.style.display = "block";
            }
        }
    }

    login.prototype.clickCloseBtn = function () {
        var _this = this;
        this.closeBtn.onclick = function () {
            _this.loginPanel.style.display = "none";
        }
    }

    login.prototype.clickSubmitBtn = function () {
        var _this = this;

        this.submitBtn.onclick = function () {
            _this.nameInput = MyLib.getObj.getElem(".js-name", _this.loginPanel);
            _this.passwordInput = MyLib.getObj.getElem(".js-password", _this.loginPanel);
            var name = hex_md5(_this.nameInput.value);
            var password = hex_md5(_this.passwordInput.value);
            MyLib.getData("http://study.163.com/webDev/login.htm", _this.submitHandle.bind(_this), {
                userName: name,
                password: password
            });
        }
    }

    login.prototype.submitHandle = function (data) {
        if (data === "1") {
            this.loginPanel.style.display = "none";
            MyLib.cookieMether.setCookie("loginSuc", "1", 2);
            MyLib.getData("http://study.163.com/webDev/attention.htm", this.followHandle.bind(this))
        } else {
            alert("账号或密码错误，请重新输入！");
        }
    }


    login.prototype.followHandle = function (data) {
        if (data === "1") {
            MyLib.cookieMether.setCookie("followSuc", "1", 2);
            this.followSuccess();
        }
    }

    login.prototype.followSuccess = function () {
        var _this = this;
        this.followBtn.value = "已关注";
        this.followBtn.disabled = true;
        this.cancleBtn.style.display = "inline-block";
        this.followBtn.onclick = function () {
            _this.followBtn.value = "已关注";
            _this.followBtn.disabled = true;
            _this.cancleBtn.style.display = "inline-block";
            MyLib.cookieMether.setCookie("followSuc", "1", 2);
        }
    }

    new login();

    function topBarCookie() {
        this.topBar = MyLib.getObj.getElem(".l-topbar");
        this.topBarCloseBtn = MyLib.getObj.getElem(".c-topbar__warn");
        this.bind();
    }

    topBarCookie.prototype.bind = function () {
        var _this = this;
        if (MyLib.cookieMether.getCookie("close")) {
            this.topBar.style.display = "none";
        } else {
            this.topBarCloseBtn.onclick = function () {
                _this.topBar.style.display = "none";
                MyLib.cookieMether.setCookie("close", "1", 2);
            }
        }
    }
    new topBarCookie();
}
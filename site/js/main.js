const anzhiyu = {
  debounce: function (func, wait, immediate) {
    let timeout;
    return function () {
      const context = this;
      const args = arguments;
      const later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  },

  throttle: function (func, wait, options) {
    let timeout, context, args;
    let previous = 0;
    if (!options) options = {};

    const later = function () {
      previous = options.leading === false ? 0 : new Date().getTime();
      timeout = null;
      func.apply(context, args);
      if (!timeout) context = args = null;
    };

    const throttled = function () {
      const now = new Date().getTime();
      if (!previous && options.leading === false) previous = now;
      const remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
    };

    return throttled;
  },

  sidebarPaddingR: () => {
    const innerWidth = window.innerWidth;
    const clientWidth = document.body.clientWidth;
    const paddingRight = innerWidth - clientWidth;
    if (innerWidth !== clientWidth) {
      document.body.style.paddingRight = paddingRight + "px";
    }
  },

  snackbarShow: (text, showActionFunction = false, duration = 2000, actionText = false) => {
    const { position, bgLight, bgDark } = GLOBAL_CONFIG.Snackbar;
    const bg = document.documentElement.getAttribute("data-theme") === "light" ? bgLight : bgDark;
    const root = document.querySelector(":root");
    root.style.setProperty("--anzhiyu-snackbar-time", duration + "ms");

    Snackbar.show({
      text: text,
      backgroundColor: bg,
      onActionClick: showActionFunction,
      actionText: actionText,
      showAction: actionText,
      duration: duration,
      pos: position,
      customClass: "snackbar-css",
    });
  },

  loadComment: (dom, callback) => {
    if ("IntersectionObserver" in window) {
      const observerItem = new IntersectionObserver(
        entries => {
          if (entries[0].isIntersecting) {
            callback();
            observerItem.disconnect();
          }
        },
        { threshold: [0] }
      );
      observerItem.observe(dom);
    } else {
      callback();
    }
  },

  scrollToDest: (pos, time = 500) => {
    const currentPos = window.pageYOffset;
    // if (currentPos > pos) pos = pos - 60;

    if ("scrollBehavior" in document.documentElement.style) {
      window.scrollTo({
        top: pos,
        behavior: "smooth",
      });
      return;
    }

    let start = null;
    pos = +pos;
    window.requestAnimationFrame(function step(currentTime) {
      start = !start ? currentTime : start;
      const progress = currentTime - start;
      if (currentPos < pos) {
        window.scrollTo(0, ((pos - currentPos) * progress) / time + currentPos);
      } else {
        window.scrollTo(0, currentPos - ((currentPos - pos) * progress) / time);
      }
      if (progress < time) {
        window.requestAnimationFrame(step);
      } else {
        window.scrollTo(0, pos);
      }
    });
  },

  animateIn: (ele, text) => {
    ele.style.display = "block";
    ele.style.animation = text;
  },

  animateOut: (ele, text) => {
    ele.addEventListener("animationend", function f() {
      ele.style.display = "";
      ele.style.animation = "";
      ele.removeEventListener("animationend", f);
    });
    ele.style.animation = text;
  },

  getParents: (elem, selector) => {
    for (; elem && elem !== document; elem = elem.parentNode) {
      if (elem.matches(selector)) return elem;
    }
    return null;
  },

  siblings: (ele, selector) => {
    return [...ele.parentNode.children].filter(child => {
      if (selector) {
        return child !== ele && child.matches(selector);
      }
      return child !== ele;
    });
  },

  /**
   * @param {*} selector
   * @param {*} eleType the type of create element
   * @param {*} options object key: value
   */
  wrap: (selector, eleType, options) => {
    const creatEle = document.createElement(eleType);
    for (const [key, value] of Object.entries(options)) {
      creatEle.setAttribute(key, value);
    }
    selector.parentNode.insertBefore(creatEle, selector);
    creatEle.appendChild(selector);
  },

  unwrap: el => {
    const elParentNode = el.parentNode;
    if (elParentNode !== document.body) {
      elParentNode.parentNode.insertBefore(el, elParentNode);
      elParentNode.parentNode.removeChild(elParentNode);
    }
  },

  isHidden: ele => ele.offsetHeight === 0 && ele.offsetWidth === 0,

  getEleTop: ele => {
    let actualTop = ele.offsetTop;
    let current = ele.offsetParent;

    while (current !== null) {
      actualTop += current.offsetTop;
      current = current.offsetParent;
    }

    return actualTop;
  },

  loadLightbox: ele => {
    const service = GLOBAL_CONFIG.lightbox;

    if (service === "mediumZoom") {
      const zoom = mediumZoom(ele);
      zoom.on("open", e => {
        const photoBg = document.documentElement.getAttribute("data-theme") === "dark" ? "#121212" : "#fff";
        zoom.update({
          background: photoBg,
        });
      });
    }

    if (service === "fancybox") {
      ele.forEach(i => {
        if (i.parentNode.tagName !== "A") {
          const dataSrc = i.dataset.lazySrc || i.src;
          const dataCaption = i.title || i.alt || "";
          anzhiyu.wrap(i, "a", {
            href: dataSrc,
            "data-fancybox": "gallery",
            "data-caption": dataCaption,
            "data-thumb": dataSrc,
          });
        }
      });

      if (!window.fancyboxRun) {
        Fancybox.bind("[data-fancybox]", {
          Hash: false,
          Thumbs: {
            autoStart: false,
          },
        });
        window.fancyboxRun = true;
      }
    }
  },

  initJustifiedGallery: function (selector) {
    const runJustifiedGallery = i => {
      if (!anzhiyu.isHidden(i)) {
        fjGallery(i, {
          itemSelector: ".fj-gallery-item",
          rowHeight: i.getAttribute("data-rowHeight"),
          gutter: 4,
          onJustify: function () {
            this.$container.style.opacity = "1";
          },
        });
      }
    };

    if (Array.from(selector).length === 0) runJustifiedGallery(selector);
    else
      selector.forEach(i => {
        runJustifiedGallery(i);
      });
  },

  updateAnchor: anchor => {
    if (anchor !== window.location.hash) {
      if (!anchor) anchor = location.pathname;
      const title = GLOBAL_CONFIG_SITE.title;
      window.history.replaceState(
        {
          url: location.href,
          title: title,
        },
        title,
        anchor
      );
    }
  },

  //更改主题色
  changeThemeMetaColor: function (color) {
    // console.info(`%c ${color}`, `font-size:36px;color:${color};`);
    if (themeColorMeta !== null) {
      themeColorMeta.setAttribute("content", color);
    }
  },

  //顶栏自适应主题色
  initThemeColor: function () {
    let themeColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--anzhiyu-bar-background")
      .trim()
      .replace('"', "")
      .replace('"', "");
    const currentTop = window.scrollY || document.documentElement.scrollTop;
    if (currentTop > 26) {
      if (anzhiyu.is_Post()) {
        themeColor = getComputedStyle(document.documentElement)
          .getPropertyValue("--anzhiyu-meta-theme-post-color")
          .trim()
          .replace('"', "")
          .replace('"', "");
      }
      if (themeColorMeta.getAttribute("content") === themeColor) return;
      this.changeThemeMetaColor(themeColor);
    } else {
      if (themeColorMeta.getAttribute("content") === themeColor) return;
      this.changeThemeMetaColor(themeColor);
    }
  },
  switchDarkMode: () => {
    // Switch Between Light And Dark Mode
    const nowMode = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const rightMenu = document.getElementById("rightMenu");
    if (nowMode === "light") {
      activateDarkMode();
      saveToLocal.set("theme", "dark", 2);
      GLOBAL_CONFIG.Snackbar !== undefined && anzhiyu.snackbarShow(GLOBAL_CONFIG.Snackbar.day_to_night);
      rightMenu.querySelector(".menu-darkmode-text").textContent = "浅色模式";
    } else {
      activateLightMode();
      saveToLocal.set("theme", "light", 2);
      GLOBAL_CONFIG.Snackbar !== undefined && anzhiyu.snackbarShow(GLOBAL_CONFIG.Snackbar.night_to_day);
      rightMenu.querySelector(".menu-darkmode-text").textContent = "深色模式";
    }
    // handle some cases
    typeof runMermaid === "function" && window.runMermaid();
    rm && rm.hideRightMenu();
    anzhiyu.darkModeStatus();

    const root = document.querySelector(":root");
    root.style.setProperty("--anzhiyu-bar-background", "var(--anzhiyu-meta-theme-color)");
    anzhiyu.initThemeColor();

    // 要改回来默认主色
    document.documentElement.style.setProperty(
      "--anzhiyu-main",
      getComputedStyle(document.documentElement).getPropertyValue("--anzhiyu-theme")
    );
    document.documentElement.style.setProperty(
      "--anzhiyu-theme-op",
      getComputedStyle(document.documentElement).getPropertyValue("--anzhiyu-main") + "23"
    );
    document.documentElement.style.setProperty(
      "--anzhiyu-theme-op-deep",
      getComputedStyle(document.documentElement).getPropertyValue("--anzhiyu-main") + "dd"
    );
  },
  //是否是文章页
  is_Post: function () {
    var url = window.location.href; //获取url
    if (url.indexOf("/posts/") >= 0) {
      //判断url地址中是否包含code字符串
      return true;
    } else {
      return false;
    }
  },
  //监测是否在页面开头
  addNavBackgroundInit: function () {
    var scrollTop = 0,
      bodyScrollTop = 0,
      documentScrollTop = 0;
    if ($bodyWrap) {
      bodyScrollTop = $bodyWrap.scrollTop;
    }
    if (document.documentElement) {
      documentScrollTop = document.documentElement.scrollTop;
    }
    scrollTop = bodyScrollTop - documentScrollTop > 0 ? bodyScrollTop : documentScrollTop;

    if (scrollTop != 0) {
      pageHeaderEl.classList.add("nav-fixed");
      pageHeaderEl.classList.add("nav-visible");
    }
  },
  // 下载图片
  downloadImage: function (imgsrc, name) {
    //下载图片地址和图片名
    rm.hideRightMenu();
    if (rm.downloadimging == false) {
      rm.downloadimging = true;
      anzhiyu.snackbarShow("正在下载中，请稍后", false, 10000);
      setTimeout(function () {
        let image = new Image();
        // 解决跨域 Canvas 污染问题
        image.setAttribute("crossOrigin", "anonymous");
        image.onload = function () {
          let canvas = document.createElement("canvas");
          canvas.width = image.width;
          canvas.height = image.height;
          let context = canvas.getContext("2d");
          context.drawImage(image, 0, 0, image.width, image.height);
          let url = canvas.toDataURL("image/png"); //得到图片的base64编码数据
          let a = document.createElement("a"); // 生成一个a元素
          let event = new MouseEvent("click"); // 创建一个单击事件
          a.download = name || "photo"; // 设置图片名称
          a.href = url; // 将生成的URL设置为a.href属性
          a.dispatchEvent(event); // 触发a的单击事件
        };
        image.src = imgsrc;
        anzhiyu.snackbarShow("图片已添加盲水印，请遵守版权协议");
        rm.downloadimging = false;
      }, "10000");
    } else {
      anzhiyu.snackbarShow("有正在进行中的下载，请稍后再试");
    }
  },
  //禁止图片右键单击
  stopImgRightDrag: function () {
    var img = document.getElementsByTagName("img");
    for (var i = 0; i < img.length; i++) {
      img[i].addEventListener("dragstart", function () {
        return false;
      });
    }
  },
  //滚动到指定id
  scrollTo: function (id) {
    var domTop = document.querySelector(id).offsetTop;
    window.scrollTo(0, domTop - 80);
  },
  //隐藏侧边栏
  hideAsideBtn: () => {
    // Hide aside
    const $htmlDom = document.documentElement.classList;
    $htmlDom.contains("hide-aside")
      ? saveToLocal.set("aside-status", "show", 2)
      : saveToLocal.set("aside-status", "hide", 2);
    $htmlDom.toggle("hide-aside");
    $htmlDom.contains("hide-aside")
      ? document.querySelector("#consoleHideAside").classList.add("on")
      : document.querySelector("#consoleHideAside").classList.remove("on");
  },
  // 热评切换
  switchCommentBarrage: function () {
    let commentBarrage = document.querySelector(".comment-barrage");
    if (commentBarrage) {
      if (window.getComputedStyle(commentBarrage).display === "flex") {
        commentBarrage.style.display = "none";
        anzhiyu.snackbarShow("✨ 已关闭评论弹幕");
        document.querySelector(".menu-commentBarrage-text").textContent = "显示热评";
        document.querySelector("#consoleCommentBarrage").classList.remove("on");
        localStorage.setItem("commentBarrageSwitch", "false");
      } else {
        commentBarrage.style.display = "flex";
        document.querySelector(".menu-commentBarrage-text").textContent = "关闭热评";
        document.querySelector("#consoleCommentBarrage").classList.add("on");
        anzhiyu.snackbarShow("✨ 已开启评论弹幕");
        localStorage.removeItem("commentBarrageSwitch");
      }
    }
    rm.hideRightMenu();
  },
  // 初始化即刻
  initIndexEssay: function () {
    if (!document.getElementById("bbTimeList")) return;
    setTimeout(() => {
      let essay_bar_swiper = new Swiper(".essay_bar_swiper_container", {
        passiveListeners: true,
        direction: "vertical",
        loop: true,
        autoplay: {
          disableOnInteraction: true,
          delay: 3000,
        },
        mousewheel: true,
      });

      let essay_bar_comtainer = document.getElementById("bbtalk");
      if (essay_bar_comtainer !== null) {
        essay_bar_comtainer.onmouseenter = function () {
          essay_bar_swiper.autoplay.stop();
        };
        essay_bar_comtainer.onmouseleave = function () {
          essay_bar_swiper.autoplay.start();
        };
      }
    }, 100);
  },
  scrollByMouseWheel: function ($list, $target) {
    const scrollHandler = function (e) {
      $list.scrollLeft -= e.wheelDelta / 2;
      e.preventDefault();
    };
    $list.addEventListener("mousewheel", scrollHandler, { passive: false });
    if ($target) {
      $target.classList.add("selected");
      $list.scrollLeft = $target.offsetLeft - $list.offsetLeft - ($list.offsetWidth - $target.offsetWidth) / 2;
    }
  },
  // catalog激活
  catalogActive: function () {
    const $list = document.getElementById("catalog-list");
    if ($list) {
      const pathname = decodeURIComponent(window.location.pathname);
      const catalogListItems = $list.querySelectorAll(".catalog-list-item");

      let $catalog = null;
      catalogListItems.forEach(item => {
        if (pathname.startsWith(item.id)) {
          $catalog = item;
          return;
        }
      });

      anzhiyu.scrollByMouseWheel($list, $catalog);
    }
  },
  // Page Tag 激活
  tagsPageActive: function () {
    const $list = document.getElementById("tag-page-tags");
    if ($list) {
      const $tagPageTags = document.getElementById(decodeURIComponent(window.location.pathname));
      anzhiyu.scrollByMouseWheel($list, $tagPageTags);
    }
  },
  // 修改时间显示"最近"
  diffDate: function (d, more = false, simple = false) {
    const dateNow = new Date();
    const datePost = new Date(d);
    const dateDiff = dateNow.getTime() - datePost.getTime();
    const minute = 1000 * 60;
    const hour = minute * 60;
    const day = hour * 24;
    const month = day * 30;

    let result;
    if (more) {
      const monthCount = dateDiff / month;
      const dayCount = dateDiff / day;
      const hourCount = dateDiff / hour;
      const minuteCount = dateDiff / minute;

      if (monthCount >= 1) {
        result = datePost.toLocaleDateString().replace(/\//g, "-");
      } else if (dayCount >= 1) {
        result = parseInt(dayCount) + " " + GLOBAL_CONFIG.date_suffix.day;
      } else if (hourCount >= 1) {
        result = parseInt(hourCount) + " " + GLOBAL_CONFIG.date_suffix.hour;
      } else if (minuteCount >= 1) {
        result = parseInt(minuteCount) + " " + GLOBAL_CONFIG.date_suffix.min;
      } else {
        result = GLOBAL_CONFIG.date_suffix.just;
      }
    } else if (simple) {
      const monthCount = dateDiff / month;
      const dayCount = dateDiff / day;
      const hourCount = dateDiff / hour;
      const minuteCount = dateDiff / minute;
      if (monthCount >= 1) {
        result = datePost.toLocaleDateString().replace(/\//g, "-");
      } else if (dayCount >= 1 && dayCount <= 3) {
        result = parseInt(dayCount) + " " + GLOBAL_CONFIG.date_suffix.day;
      } else if (dayCount > 3) {
        result = datePost.getMonth() + 1 + "/" + datePost.getDate();
      } else if (hourCount >= 1) {
        result = parseInt(hourCount) + " " + GLOBAL_CONFIG.date_suffix.hour;
      } else if (minuteCount >= 1) {
        result = parseInt(minuteCount) + " " + GLOBAL_CONFIG.date_suffix.min;
      } else {
        result = GLOBAL_CONFIG.date_suffix.just;
      }
    } else {
      result = parseInt(dateDiff / day);
    }
    return result;
  },

  // 修改即刻中的时间显示
  changeTimeInEssay: function () {
    document.querySelector("#bber") &&
      document.querySelectorAll("#bber time").forEach(function (e) {
        var t = e,
          datetime = t.getAttribute("datetime");
        (t.innerText = anzhiyu.diffDate(datetime, true)), (t.style.display = "inline");
      });
  },
  // 修改相册集中的时间
  changeTimeInAlbumDetail: function () {
    document.querySelector("#album_detail") &&
      document.querySelectorAll("#album_detail time").forEach(function (e) {
        var t = e,
          datetime = t.getAttribute("datetime");
        (t.innerText = anzhiyu.diffDate(datetime, true)), (t.style.display = "inline");
      });
  },
  // 刷新瀑布流
  reflashEssayWaterFall: function () {
    const waterfallEl = document.getElementById("waterfall");
    if (waterfallEl) {
      setTimeout(function () {
        waterfall(waterfallEl);
        waterfallEl.classList.add("show");
      }, 800);
    }
  },
  sayhi: function () {
    const $sayhiEl = document.getElementById("author-info__sayhi");

    const getTimeState = () => {
      const hour = new Date().getHours();
      let message = "";

      if (hour >= 0 && hour <= 5) {
        message = "睡个好觉，保证精力充沛";
      } else if (hour > 5 && hour <= 10) {
        message = "一日之计在于晨";
      } else if (hour > 10 && hour <= 14) {
        message = "吃饱了才有力气干活";
      } else if (hour > 14 && hour <= 18) {
        message = "集中精力，攻克难关";
      } else if (hour > 18 && hour <= 24) {
        message = "不要太劳累了，早睡更健康";
      }

      return message;
    };

    if ($sayhiEl) {
      $sayhiEl.innerHTML = getTimeState();
    }
  },

  // 友链注入预设评论
  addFriendLink() {
    var input = document.getElementsByClassName("el-textarea__inner")[0];
    if (!input) return;
    let evt = document.createEvent("HTMLEvents");
    evt.initEvent("input", true, true);
    input.value =
      "昵称（请勿包含博客等字样）：\n网站地址（要求博客地址，请勿提交个人主页）：\n头像图片url（请提供尽可能清晰的图片，我会上传到我自己的图床）：\n描述：\n站点截图（可选）：\n";
    input.dispatchEvent(evt);
    input.focus();
    input.setSelectionRange(-1, -1);
  },
  //切换音乐播放状态
  musicToggle: function (changePaly = true) {
    if (!anzhiyu_musicFirst) {
      anzhiyu.musicBindEvent();
      anzhiyu_musicFirst = true;
    }
    let msgPlay = '<i class="anzhiyufont anzhiyu-icon-play"></i><span>播放音乐</span>';
    let msgPause = '<i class="anzhiyufont anzhiyu-icon-pause"></i><span>暂停音乐</span>';
    if (anzhiyu_musicPlaying) {
      navMusicEl.classList.remove("playing");
      document.getElementById("menu-music-toggle").innerHTML = msgPlay;
      document.getElementById("nav-music-hoverTips").innerHTML = "音乐已暂停";
      document.querySelector("#consoleMusic").classList.remove("on");
      anzhiyu_musicPlaying = false;
      navMusicEl.classList.remove("stretch");
    } else {
      navMusicEl.classList.add("playing");
      document.getElementById("menu-music-toggle").innerHTML = msgPause;
      document.querySelector("#consoleMusic").classList.add("on");
      anzhiyu_musicPlaying = true;
      navMusicEl.classList.add("stretch");
    }
    if (changePaly) document.querySelector("#nav-music meting-js").aplayer.toggle();
    rm.hideRightMenu();
  },
  // 音乐伸缩
  musicTelescopic: function () {
    if (navMusicEl.classList.contains("stretch")) {
      navMusicEl.classList.remove("stretch");
    } else {
      navMusicEl.classList.add("stretch");
    }
  },

  //音乐上一曲
  musicSkipBack: function () {
    navMusicEl.querySelector("meting-js").aplayer.skipBack();
    rm.hideRightMenu();
  },

  //音乐下一曲
  musicSkipForward: function () {
    navMusicEl.querySelector("meting-js").aplayer.skipForward();
    rm.hideRightMenu();
  },

  //获取音乐中的名称
  musicGetName: function () {
    var x = document.querySelector(".aplayer-title");
    var arr = [];
    for (var i = x.length - 1; i >= 0; i--) {
      arr[i] = x[i].innerText;
    }
    return arr[0];
  },

  // 检测显示模式
  darkModeStatus: function () {
    let theme = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const menuDarkmodeText = document.querySelector(".menu-darkmode-text");

    if (theme === "light") {
      menuDarkmodeText.textContent = "深色模式";
    } else {
      menuDarkmodeText.textContent = "浅色模式";
    }
  },

  //初始化console图标
  initConsoleState: function () {
    //初始化隐藏边栏
    const $htmlDomClassList = document.documentElement.classList;
    $htmlDomClassList.contains("hide-aside")
      ? document.querySelector("#consoleHideAside").classList.add("on")
      : document.querySelector("#consoleHideAside").classList.remove("on");
  },

  // 显示打赏中控台
  rewardShowConsole: function () {
    // 判断是否为赞赏打开控制台
    consoleEl.classList.add("reward-show");
    anzhiyu.initConsoleState();
  },
  // 显示中控台
  showConsole: function () {
    consoleEl.classList.add("show");
    anzhiyu.initConsoleState();
  },

  //隐藏中控台
  hideConsole: function () {
    if (consoleEl.classList.contains("show")) {
      // 如果是一般控制台，就关闭一般控制台
      consoleEl.classList.remove("show");
    } else if (consoleEl.classList.contains("reward-show")) {
      // 如果是打赏控制台，就关闭打赏控制台
      consoleEl.classList.remove("reward-show");
    }
    // 获取center-console元素
    const centerConsole = document.getElementById("center-console");

    // 检查center-console是否被选中
    if (centerConsole.checked) {
      // 取消选中状态
      centerConsole.checked = false;
    }
  },
  // 取消加载动画
  hideLoading: function () {
    document.getElementById("loading-box").classList.add("loaded");
  },
  // 将音乐缓存播放
  cacheAndPlayMusic() {
    let data = localStorage.getItem("musicData");
    if (data) {
      data = JSON.parse(data);
      const currentTime = new Date().getTime();
      if (currentTime - data.timestamp < 24 * 60 * 60 * 1000) {
        // 如果缓存的数据没有过期，直接使用
        anzhiyu.playMusic(data.songs);
        return;
      }
    }

    // 否则重新从服务器获取数据
    fetch("/json/music.json")
      .then(response => response.json())
      .then(songs => {
        const cacheData = {
          timestamp: new Date().getTime(),
          songs: songs,
        };
        localStorage.setItem("musicData", JSON.stringify(cacheData));
        anzhiyu.playMusic(songs);
      });
  },
  // 播放音乐
  playMusic(songs) {
    const anMusicPage = document.getElementById("anMusic-page");
    const metingAplayer = anMusicPage.querySelector("meting-js").aplayer;
    const randomIndex = Math.floor(Math.random() * songs.length);
    const randomSong = songs[randomIndex];
    const allAudios = metingAplayer.list.audios;
    if (!selectRandomSong.includes(randomSong.name)) {
      // 如果随机到的歌曲已经未被随机到过，就添加进metingAplayer.list
      metingAplayer.list.add([randomSong]);
      // 播放最后一首(因为是添加到了最后)
      metingAplayer.list.switch(allAudios.length);
      // 添加到已被随机的歌曲列表
      selectRandomSong.push(randomSong.name);
    } else {
      // 随机到的歌曲已经在播放列表中了
      // 直接继续随机直到随机到没有随机过的歌曲，如果全部随机过了就切换到对应的歌曲播放即可
      let songFound = false;
      while (!songFound) {
        const newRandomIndex = Math.floor(Math.random() * songs.length);
        const newRandomSong = songs[newRandomIndex];
        if (!selectRandomSong.includes(newRandomSong.name)) {
          metingAplayer.list.add([newRandomSong]);
          metingAplayer.list.switch(allAudios.length);
          selectRandomSong.push(newRandomSong.name);
          songFound = true;
        }
        // 如果全部歌曲都已被随机过，跳出循环
        if (selectRandomSong.length === songs.length) {
          break;
        }
      }
      if (!songFound) {
        // 如果全部歌曲都已被随机过，切换到对应的歌曲播放
        const palyMusicIndex = allAudios.findIndex(song => song.name === randomSong.name);
        if (palyMusicIndex != -1) metingAplayer.list.switch(palyMusicIndex);
      }
    }

    console.info("已随机歌曲：", selectRandomSong, "本次随机歌曲：", randomSong.name);
  },
  // 音乐节目切换背景
  changeMusicBg: function (isChangeBg = true) {
    const anMusicBg = document.getElementById("an_music_bg");

    if (isChangeBg) {
      // player listswitch 会进入此处
      const musiccover = document.querySelector("#anMusic-page .aplayer-pic");
      anMusicBg.style.backgroundImage = musiccover.style.backgroundImage;
      $web_container.style.background = "none";
    } else {
      // 第一次进入，绑定事件，改背景
      let timer = setInterval(() => {
        const musiccover = document.querySelector("#anMusic-page .aplayer-pic");
        // 确保player加载完成
        if (musiccover) {
          clearInterval(timer);
          // 绑定事件
          anzhiyu.addEventListenerMusic();
          // 确保第一次能够正确替换背景
          anzhiyu.changeMusicBg();

          // 暂停nav的音乐
          if (
            document.querySelector("#nav-music meting-js").aplayer &&
            !document.querySelector("#nav-music meting-js").aplayer.audio.paused
          ) {
            anzhiyu.musicToggle();
          }
        }
      }, 100);
    }
  },
  // 获取自定义播放列表
  getCustomPlayList: function () {
    if (!window.location.pathname.startsWith("/music/")) {
      return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const userId = "8152976493";
    const userServer = "netease";
    const anMusicPageMeting = document.getElementById("anMusic-page-meting");
    if (urlParams.get("id") && urlParams.get("server")) {
      const id = urlParams.get("id");
      const server = urlParams.get("server");
      anMusicPageMeting.innerHTML = `<meting-js id="${id}" server=${server} type="playlist" type="playlist" mutex="true" preload="auto" theme="var(--anzhiyu-main)" order="list" list-max-height="calc(100vh - 169px)!important"></meting-js>`;
    } else {
      anMusicPageMeting.innerHTML = `<meting-js id="${userId}" server="${userServer}" type="playlist" mutex="true" preload="auto" theme="var(--anzhiyu-main)" order="list" list-max-height="calc(100vh - 169px)!important"></meting-js>`;
    }
    anzhiyu.changeMusicBg(false);
  },
  //隐藏今日推荐
  hideTodayCard: function () {
    if (document.getElementById("todayCard")) {
      document.getElementById("todayCard").classList.add("hide");
      const topGroup = document.querySelector(".topGroup");
      const recentPostItems = topGroup.querySelectorAll(".recent-post-item");
      recentPostItems.forEach(item => {
        item.style.display = "flex";
      });
    }
  },

  // 监听音乐背景改变
  addEventListenerMusic: function () {
    const anMusicPage = document.getElementById("anMusic-page");
    const aplayerIconMenu = anMusicPage.querySelector(".aplayer-info .aplayer-time .aplayer-icon-menu");
    const anMusicBtnGetSong = anMusicPage.querySelector("#anMusicBtnGetSong");
    const anMusicRefreshBtn = anMusicPage.querySelector("#anMusicRefreshBtn");
    const anMusicSwitchingBtn = anMusicPage.querySelector("#anMusicSwitching");
    const metingAplayer = anMusicPage.querySelector("meting-js").aplayer;
    //初始化音量
    metingAplayer.volume(0.8, true);
    metingAplayer.on("loadeddata", function () {
      anzhiyu.changeMusicBg();
    });

    aplayerIconMenu.addEventListener("click", function () {
      document.getElementById("menu-mask").style.display = "block";
      document.getElementById("menu-mask").style.animation = "0.5s ease 0s 1 normal none running to_show";
      anMusicPage.querySelector(".aplayer.aplayer-withlist .aplayer-list").style.opacity = "1";
    });

    function anMusicPageMenuAask() {
      if (window.location.pathname != "/music/") {
        document.getElementById("menu-mask").removeEventListener("click", anMusicPageMenuAask);
        return;
      }

      anMusicPage.querySelector(".aplayer-list").classList.remove("aplayer-list-hide");
    }

    document.getElementById("menu-mask").addEventListener("click", anMusicPageMenuAask);

    // 监听增加单曲按钮
    anMusicBtnGetSong.addEventListener("click", () => {
      if (changeMusicListFlag) {
        const anMusicPage = document.getElementById("anMusic-page");
        const metingAplayer = anMusicPage.querySelector("meting-js").aplayer;
        const allAudios = metingAplayer.list.audios;
        const randomIndex = Math.floor(Math.random() * allAudios.length);
        // 随机播放一首
        metingAplayer.list.switch(randomIndex);
      } else {
        anzhiyu.cacheAndPlayMusic();
      }
    });
    anMusicRefreshBtn.addEventListener("click", () => {
      localStorage.removeItem("musicData");
      anzhiyu.snackbarShow("已移除相关缓存歌曲");
    });
    anMusicSwitchingBtn.addEventListener("click", () => {
      anzhiyu.changeMusicList();
    });

    // 监听键盘事件
    //空格控制音乐
    document.addEventListener("keydown", function (event) {
      //暂停开启音乐
      if (event.code === "Space") {
        event.preventDefault();
        metingAplayer.toggle();
      }
      //切换下一曲
      if (event.keyCode === 39) {
        event.preventDefault();
        metingAplayer.skipForward();
      }
      //切换上一曲
      if (event.keyCode === 37) {
        event.preventDefault();
        metingAplayer.skipBack();
      }
      //增加音量
      if (event.keyCode === 38) {
        if (musicVolume <= 1) {
          musicVolume += 0.1;
          metingAplayer.volume(musicVolume, true);
        }
      }
      //减小音量
      if (event.keyCode === 40) {
        if (musicVolume >= 0) {
          musicVolume += -0.1;
          metingAplayer.volume(musicVolume, true);
        }
      }
    });
  },
  // 切换歌单
  changeMusicList: async function () {
    const anMusicPage = document.getElementById("anMusic-page");
    const metingAplayer = anMusicPage.querySelector("meting-js").aplayer;
    const currentTime = new Date().getTime();
    const cacheData = JSON.parse(localStorage.getItem("musicData")) || { timestamp: 0 };
    let songs = [];

    if (changeMusicListFlag) {
      songs = defaultPlayMusicList;
    } else {
      // 保存当前默认播放列表，以使下次可以切换回来
      defaultPlayMusicList = metingAplayer.list.audios;
      // 如果缓存的数据没有过期，直接使用
      if (currentTime - cacheData.timestamp < 24 * 60 * 60 * 1000) {
        songs = cacheData.songs;
      } else {
        // 否则重新从服务器获取数据
        const response = await fetch("/json/music.json");
        songs = await response.json();
        cacheData.timestamp = currentTime;
        cacheData.songs = songs;
        localStorage.setItem("musicData", JSON.stringify(cacheData));
      }
    }

    // 清除当前播放列表并添加新的歌曲
    metingAplayer.list.clear();
    metingAplayer.list.add(songs);

    // 切换标志位
    changeMusicListFlag = !changeMusicListFlag;
  },
  // 控制台音乐列表监听
  addEventListenerConsoleMusicList: function () {
    const navMusic = document.getElementById("nav-music");
    if (!navMusic) return;
    navMusic.addEventListener("click", e => {
      const aplayerList = navMusic.querySelector(".aplayer-list");
      const listBtn = navMusic.querySelector(
        "div.aplayer-info > div.aplayer-controller > div.aplayer-time.aplayer-time-narrow > button.aplayer-icon.aplayer-icon-menu svg"
      );
      if (e.target != listBtn && aplayerList.classList.contains("aplayer-list-hide")) {
        aplayerList.classList.remove("aplayer-list-hide");
      }
    });
  },
  // 监听按键
  toPage: function () {
    var toPageText = document.getElementById("toPageText"),
      toPageButton = document.getElementById("toPageButton"),
      pageNumbers = document.querySelectorAll(".page-number"),
      lastPageNumber = Number(pageNumbers[pageNumbers.length - 1].innerHTML),
      pageNumber = Number(toPageText.value);

    if (!isNaN(pageNumber) && pageNumber >= 1 && Number.isInteger(pageNumber)) {
      var url = "/page/" + (pageNumber > lastPageNumber ? lastPageNumber : pageNumber) + "/";
      toPageButton.href = pageNumber === 1 ? "/" : url;
    } else {
      toPageButton.href = "javascript:void(0);";
    }
  },

  //删除多余的class
  removeBodyPaceClass: function () {
    document.body.className = "pace-done";
  },
  // 修改body的type类型以适配css
  setValueToBodyType: function () {
    const input = document.getElementById("page-type"); // 获取input元素
    const value = input.value; // 获取input的value值
    document.body.dataset.type = value; // 将value值赋值到body的type属性上
  },
  //匿名评论
  addRandomCommentInfo: function () {
    // 从形容词数组中随机取一个值
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];

    // 从蔬菜水果动物名字数组中随机取一个值
    const randomName = vegetablesAndFruits[Math.floor(Math.random() * vegetablesAndFruits.length)];

    // 将两个值组合成一个字符串
    const name = `${randomAdjective}${randomName}`;

    function dr_js_autofill_commentinfos() {
      var lauthor = [
          "#author",
          "input[name='comname']",
          "#inpName",
          "input[name='author']",
          "#ds-dialog-name",
          "#name",
          "input[name='nick']",
          "#comment_author",
        ],
        lmail = [
          "#mail",
          "#email",
          "input[name='commail']",
          "#inpEmail",
          "input[name='email']",
          "#ds-dialog-email",
          "input[name='mail']",
          "#comment_email",
        ],
        lurl = [
          "#url",
          "input[name='comurl']",
          "#inpHomePage",
          "#ds-dialog-url",
          "input[name='url']",
          "input[name='website']",
          "#website",
          "input[name='link']",
          "#comment_url",
        ];
      for (var i = 0; i < lauthor.length; i++) {
        var author = document.querySelector(lauthor[i]);
        if (author != null) {
          author.value = name;
          author.dispatchEvent(new Event("input"));
          author.dispatchEvent(new Event("change"));
          break;
        }
      }
      for (var j = 0; j < lmail.length; j++) {
        var mail = document.querySelector(lmail[j]);
        if (mail != null) {
          mail.value = visitorMail;
          mail.dispatchEvent(new Event("input"));
          mail.dispatchEvent(new Event("change"));
          break;
        }
      }
      return !1;
    }

    dr_js_autofill_commentinfos();
    var input = document.getElementsByClassName("el-textarea__inner")[0];
    input.focus();
    input.setSelectionRange(-1, -1);
  },

  // 跳转开往
  totraveling: function () {
    anzhiyu.snackbarShow(
      "即将跳转到「开往」项目的成员博客，不保证跳转网站的安全性和可用性",
      element => {
        element.style.opacity = 0;
        travellingsTimer && clearTimeout(travellingsTimer);
      },
      5000,
      "取消"
    );
    travellingsTimer = setTimeout(function () {
      window.open("https://www.travellings.cn/go.html");
    }, "5000");
  },

  // 工具函数替换字符串
  replaceAll: function (e, n, t) {
    return e.split(n).join(t);
  },

  // 音乐绑定事件
  musicBindEvent: function () {
    document.querySelector("#nav-music .aplayer-music").addEventListener("click", function () {
      anzhiyu.musicTelescopic();
    });
    document.querySelector("#nav-music .aplayer-button").addEventListener("click", function () {
      anzhiyu.musicToggle(false);
    });
  },

  // 判断是否是移动端
  hasMobile: function () {
    let isMobile = false;
    if (
      navigator.userAgent.match(
        /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
      ) ||
      document.body.clientWidth < 800
    ) {
      // 移动端
      isMobile = true;
    }
    return isMobile;
  },

  // 创建二维码
  qrcodeCreate: function () {
    if (document.getElementById("qrcode")) {
      document.getElementById("qrcode").innerHTML = "";
      var qrcode = new QRCode(document.getElementById("qrcode"), {
        text: window.location.href,
        width: 250,
        height: 250,
        colorDark: "#000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H,
      });
    }
  },

  // 判断是否在el内
  isInViewPortOfOne: function (el) {
    if (!el) return;
    const viewPortHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    const offsetTop = el.offsetTop;
    const scrollTop = document.documentElement.scrollTop;
    const top = offsetTop - scrollTop;
    return top <= viewPortHeight;
  },
  //添加赞赏蒙版
  addRewardMask: function () {
    if (!document.querySelector(".reward-main")) return;
    document.querySelector(".reward-main").style.display = "flex";
    document.querySelector(".reward-main").style.zIndex = "102";
    document.getElementById("quit-box").style.display = "flex";
  },
  // 移除赞赏蒙版
  removeRewardMask: function () {
    if (!document.querySelector(".reward-main")) return;
    document.querySelector(".reward-main").style.display = "none";
    document.getElementById("quit-box").style.display = "none";
  },

  keyboardToggle: function () {
    const isKeyboardOn = anzhiyu_keyboard;

    if (isKeyboardOn) {
      const consoleKeyboard = document.querySelector("#consoleKeyboard");
      consoleKeyboard.classList.remove("on");
      anzhiyu_keyboard = false;
    } else {
      const consoleKeyboard = document.querySelector("#consoleKeyboard");
      consoleKeyboard.classList.add("on");
      anzhiyu_keyboard = true;
    }

    localStorage.setItem("keyboardToggle", isKeyboardOn ? "false" : "true");
  },
  rightMenuToggle: function () {
    if (window.oncontextmenu) {
      window.oncontextmenu = null;
    } else if (!window.oncontextmenu && oncontextmenuFunction) {
      window.oncontextmenu = oncontextmenuFunction;
    }
  },
  switchConsole: () => {
    // switch console
    const consoleEl = document.getElementById("console");
    //初始化隐藏边栏
    const $htmlDom = document.documentElement.classList;
    $htmlDom.contains("hide-aside")
      ? document.querySelector("#consoleHideAside").classList.add("on")
      : document.querySelector("#consoleHideAside").classList.remove("on");
    if (consoleEl.classList.contains("show")) {
      consoleEl.classList.remove("show");
    } else {
      consoleEl.classList.add("show");
    }
    const consoleKeyboard = document.querySelector("#consoleKeyboard");

    if (consoleKeyboard) {
      if (localStorage.getItem("keyboardToggle") === "true") {
        consoleKeyboard.classList.add("on");
        anzhiyu_keyboard = true;
      } else {
        consoleKeyboard.classList.remove("on");
        anzhiyu_keyboard = false;
      }
    }
  },
  // 定义 intersectionObserver 函数，并接收两个可选参数
  intersectionObserver: function (enterCallback, leaveCallback) {
    let observer;
    return () => {
      if (!observer) {
        observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (entry.intersectionRatio > 0) {
              enterCallback?.();
            } else {
              leaveCallback?.();
            }
          });
        });
      } else {
        // 如果 observer 对象已经存在，则先取消对之前元素的观察
        observer.disconnect();
      }
      return observer;
    };
  },
  // CategoryBar滚动
  scrollCategoryBarToRight: function () {
    // 获取需要操作的元素
    const items = document.getElementById("catalog-list");
    const nextButton = document.getElementById("category-bar-next");

    // 检查元素是否存在
    if (items && nextButton) {
      const itemsWidth = items.clientWidth;

      // 判断是否已经滚动到最右侧
      if (items.scrollLeft + items.clientWidth + 1 >= items.scrollWidth) {
        // 滚动到初始位置并更新按钮内容
        items.scroll({
          left: 0,
          behavior: "smooth",
        });
        nextButton.innerHTML = '<i class="anzhiyufont anzhiyu-icon-angle-double-right"></i>';
      } else {
        // 滚动到下一个视图
        items.scrollBy({
          left: itemsWidth,
          behavior: "smooth",
        });
      }
    } else {
      console.error("Element(s) not found: 'catalog-list' and/or 'category-bar-next'.");
    }
  },
  // 分类条
  categoriesBarActive: function () {
    const urlinfo = decodeURIComponent(window.location.pathname);
    const $categoryBar = document.getElementById("category-bar");
    if (!$categoryBar) return;

    if (urlinfo === "/") {
      $categoryBar.querySelector("#首页").classList.add("select");
    } else {
      const pattern = /\/categories\/.*?\//;
      const patbool = pattern.test(urlinfo);
      if (!patbool) return;

      const nowCategorie = urlinfo.split("/")[2];
      $categoryBar.querySelector(`#${nowCategorie}`).classList.add("select");
    }
  },
  topCategoriesBarScroll: function () {
    const $categoryBarItems = document.getElementById("category-bar-items");
    if (!$categoryBarItems) return;

    $categoryBarItems.addEventListener("mousewheel", function (e) {
      const v = -e.wheelDelta / 2;
      this.scrollLeft += v;
      e.preventDefault();
    });
  },
  // 切换菜单显示热评
  switchRightClickMenuHotReview: function () {
    const postComment = document.getElementById("post-comment");
    const menuCommentBarrageDom = document.getElementById("menu-commentBarrage");
    if (postComment) {
      menuCommentBarrageDom.style.display = "flex";
    } else {
      menuCommentBarrageDom.style.display = "none";
    }
  },
  // 切换作者卡片状态文字
  changeSayHelloText: function () {
    console.info(GLOBAL_CONFIG);
    const greetings = GLOBAL_CONFIG.authorStatus.skills;

    const authorInfoSayHiElement = document.getElementById("author-info__sayhi");

    let lastSayHello = authorInfoSayHiElement.textContent;

    let randomGreeting = lastSayHello;
    while (randomGreeting === lastSayHello) {
      randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    }
    authorInfoSayHiElement.textContent = randomGreeting;
  },
};

!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports):"function"==typeof define&&define.amd?define(["exports"],e):e((t="undefined"!=typeof globalThis?globalThis:t||self).window=t.window||{})}(this,(function(t){"use strict";const e=t=>"object"==typeof t&&null!==t&&t.constructor===Object&&"[object Object]"===Object.prototype.toString.call(t),i=(t,...n)=>{const s=n.length;for(let o=0;o<s;o++){const s=n[o]||{};Object.entries(s).forEach((([n,s])=>{const o=Array.isArray(s)?[]:{};t[n]||Object.assign(t,{[n]:o}),e(s)?Object.assign(t[n],i(o,s)):Array.isArray(s)?Object.assign(t,{[n]:[...s]}):Object.assign(t,{[n]:s})}))}return t},n=function(t){var e=(new DOMParser).parseFromString(t,"text/html").body;if(e.childElementCount>1){for(var i=document.createElement("div");e.firstChild;)i.appendChild(e.firstChild);return i}return e.firstChild},s=t=>t&&null!==t&&t instanceof Element&&"nodeType"in t,o=function(t){const e=window.pageYOffset,i=window.pageYOffset+window.innerHeight;if(!s(t))return 0;const n=t.getBoundingClientRect(),o=n.y+window.pageYOffset,a=n.y+n.height+window.pageYOffset;if(e>a||i<o)return 0;if(e<o&&i>a)return 100;if(o<e&&a>i)return 100;let r=n.height;o<e&&(r-=window.pageYOffset-o),a>i&&(r-=a-i);const l=r/window.innerHeight*100;return Math.round(l)},a=!("undefined"==typeof window||!window.document||!window.document.createElement);let r;const l=["a[href]","area[href]",'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',"select:not([disabled]):not([aria-hidden])","textarea:not([disabled]):not([aria-hidden])","button:not([disabled]):not([aria-hidden]):not(.fancybox-focus-guard)","iframe","object","embed","video","audio","[contenteditable]",'[tabindex]:not([tabindex^="-"]):not([disabled]):not([aria-hidden])'].join(","),c=t=>{if(t&&a){void 0===r&&document.createElement("div").focus({get preventScroll(){return r=!0,!1}});try{if(r)t.focus({preventScroll:!0});else{const e=window.pageXOffset||document.body.scrollTop,i=window.pageYOffset||document.body.scrollLeft;t.focus(),document.body.scrollTo({top:e,left:i,behavior:"auto"})}}catch(t){}}},h='<div class="f-spinner"><svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="20"></circle><circle cx="25" cy="25" r="20"></circle></svg></div>',d={PANUP:"Move up",PANDOWN:"Move down",PANLEFT:"Move left",PANRIGHT:"Move right",ZOOMIN:"Zoom in",ZOOMOUT:"Zoom out",TOGGLEZOOM:"Toggle zoom level",TOGGLE1TO1:"Toggle zoom level",ITERATEZOOM:"Toggle zoom level",ROTATECCW:"Rotate counterclockwise",ROTATECW:"Rotate clockwise",FLIPX:"Flip horizontally",FLIPY:"Flip vertically",FITX:"Fit horizontally",FITY:"Fit vertically",RESET:"Reset",TOGGLEFS:"Toggle fullscreen"},u={dragToClose:!0,hideScrollbar:!0,Carousel:{classes:{container:"fancybox__carousel",viewport:"fancybox__viewport",track:"fancybox__track",slide:"fancybox__slide"}},contentClick:"toggleZoom",contentDblClick:!1,backdropClick:"close",animated:!0,idle:3500,showClass:"f-zoomInUp",hideClass:"f-fadeOut",commonCaption:!1,parentEl:null,startIndex:0,l10n:Object.assign(Object.assign({},d),{CLOSE:"Close",NEXT:"Next",PREV:"Previous",MODAL:"You can close this modal content with the ESC key",ERROR:"Something Went Wrong, Please Try Again Later",IMAGE_ERROR:"Image Not Found",ELEMENT_NOT_FOUND:"HTML Element Not Found",AJAX_NOT_FOUND:"Error Loading AJAX : Not Found",AJAX_FORBIDDEN:"Error Loading AJAX : Forbidden",IFRAME_ERROR:"Error Loading Page",TOGGLE_ZOOM:"Toggle zoom level",TOGGLE_THUMBS:"Toggle thumbnails",TOGGLE_SLIDESHOW:"Toggle slideshow",TOGGLE_FULLSCREEN:"Toggle full-screen mode",DOWNLOAD:"Download"}),tpl:{closeButton:'<button data-fancybox-close class="f-button is-close-btn" title="{{CLOSE}}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" tabindex="-1"><path d="M20 20L4 4m16 0L4 20"/></svg></button>',main:'<div class="fancybox__container" role="dialog" aria-modal="true" aria-label="{{MODAL}}" tabindex="-1">\n    <div class="fancybox__backdrop"></div>\n    <div class="fancybox__carousel"></div>\n    <div class="fancybox__footer"></div>\n  </div>'},groupAll:!1,groupAttr:"data-fancybox",defaultType:"image",defaultDisplay:"block",autoFocus:!0,trapFocus:!0,placeFocusBack:!0,closeButton:"auto",keyboard:{Escape:"close",Delete:"close",Backspace:"close",PageUp:"next",PageDown:"prev",ArrowUp:"prev",ArrowDown:"next",ArrowRight:"next",ArrowLeft:"prev"},Fullscreen:{autoStart:!1},compact:()=>window.matchMedia("(max-width: 578px), (max-height: 578px)").matches,wheel:"zoom"};var p,f;!function(t){t[t.Init=0]="Init",t[t.Ready=1]="Ready",t[t.Closing=2]="Closing",t[t.CustomClosing=3]="CustomClosing",t[t.Destroy=4]="Destroy"}(p||(p={})),function(t){t[t.Loading=0]="Loading",t[t.Opening=1]="Opening",t[t.Ready=2]="Ready",t[t.Closing=3]="Closing"}(f||(f={}));const m=function(t,e){return t.split(".").reduce(((t,e)=>"object"==typeof t?t[e]:void 0),e)};class g{constructor(t={}){Object.defineProperty(this,"options",{enumerable:!0,configurable:!0,writable:!0,value:t}),Object.defineProperty(this,"events",{enumerable:!0,configurable:!0,writable:!0,value:new Map}),this.setOptions(t);for(const t of Object.getOwnPropertyNames(Object.getPrototypeOf(this)))t.startsWith("on")&&"function"==typeof this[t]&&(this[t]=this[t].bind(this))}setOptions(t){this.options=t?i({},this.constructor.defaults,t):{};for(const[t,e]of Object.entries(this.option("on")||{}))this.on(t,e)}option(t,...e){let i=m(t,this.options);return i&&"function"==typeof i&&(i=i.call(this,this,...e)),i}optionFor(t,e,i,...n){let s=m(e,t);var o;"string"!=typeof(o=s)||isNaN(o)||isNaN(parseFloat(o))||(s=parseFloat(s)),"true"===s&&(s=!0),"false"===s&&(s=!1),s&&"function"==typeof s&&(s=s.call(this,this,t,...n));let a=m(e,this.options);return a&&"function"==typeof a?s=a.call(this,this,t,...n,s):void 0===s&&(s=a),void 0===s?i:s}cn(t){const e=this.options.classes;return e&&e[t]||""}localize(t,e=[]){t=String(t).replace(/\{\{(\w+).?(\w+)?\}\}/g,((t,e,i)=>{let n="";return i?n=this.option(`${e[0]+e.toLowerCase().substring(1)}.l10n.${i}`):e&&(n=this.option(`l10n.${e}`)),n||(n=t),n}));for(let i=0;i<e.length;i++)t=t.split(e[i][0]).join(e[i][1]);return t=t.replace(/\{\{(.*?)\}\}/g,((t,e)=>e))}on(t,e){let i=[];"string"==typeof t?i=t.split(" "):Array.isArray(t)&&(i=t),this.events||(this.events=new Map),i.forEach((t=>{let i=this.events.get(t);i||(this.events.set(t,[]),i=[]),i.includes(e)||i.push(e),this.events.set(t,i)}))}off(t,e){let i=[];"string"==typeof t?i=t.split(" "):Array.isArray(t)&&(i=t),i.forEach((t=>{const i=this.events.get(t);if(Array.isArray(i)){const t=i.indexOf(e);t>-1&&i.splice(t,1)}}))}emit(t,...e){[...this.events.get(t)||[]].forEach((t=>t(this,...e))),"*"!==t&&this.emit("*",t,...e)}}Object.defineProperty(g,"version",{enumerable:!0,configurable:!0,writable:!0,value:"5.0.14"}),Object.defineProperty(g,"defaults",{enumerable:!0,configurable:!0,writable:!0,value:{}});class b extends g{constructor(t={}){super(t),Object.defineProperty(this,"plugins",{enumerable:!0,configurable:!0,writable:!0,value:{}})}attachPlugins(t={}){const e=new Map;for(const[i,n]of Object.entries(t)){const t=this.option(i),s=this.plugins[i];s||!1===t?s&&!1===t&&(s.detach(),delete this.plugins[i]):e.set(i,new n(this,t||{}))}for(const[t,i]of e)this.plugins[t]=i,i.attach();this.emit("attachPlugins")}detachPlugins(){for(const t of Object.values(this.plugins))t.detach();return this.plugins={},this.emit("detachPlugins"),this}}class v extends g{constructor(t,e){super(e),Object.defineProperty(this,"instance",{enumerable:!0,configurable:!0,writable:!0,value:t})}attach(){}detach(){}}const y=()=>{queueMicrotask((()=>{(()=>{const{slug:t,index:e}=w.parseURL(),i=It.getInstance();if(i&&!1!==i.option("Hash")){const n=i.carousel;if(t&&n){for(let e of n.slides)if(e.slug&&e.slug===t)return n.slideTo(e.index);if(t===i.option("slug"))return n.slideTo(e-1);const s=i.getSlide(),o=s&&s.triggerEl&&s.triggerEl.dataset;if(o&&o.fancybox===t)return n.slideTo(e-1)}w.hasSilentClose=!0,i.close()}w.startFromUrl()})()}))};class w extends v{constructor(){super(...arguments),Object.defineProperty(this,"origHash",{enumerable:!0,configurable:!0,writable:!0,value:""}),Object.defineProperty(this,"timer",{enumerable:!0,configurable:!0,writable:!0,value:null})}onChange(){const t=this.instance,e=t.carousel;this.timer&&clearTimeout(this.timer);const i=t.getSlide();if(!e||!i)return;const n=t.isOpeningSlide(i),s=new URL(document.URL).hash;let o,a=i.slug||void 0;o=a||this.instance.option("slug"),!o&&i.triggerEl&&i.triggerEl.dataset&&(o=i.triggerEl.dataset.fancybox);let r="";o&&"true"!==o&&(r="#"+o+(!a&&e.slides.length>1?"-"+(i.index+1):"")),n&&(this.origHash=s!==r?s:""),r&&s!==r&&(this.timer=setTimeout((()=>{try{window.history[n?"pushState":"replaceState"]({},document.title,window.location.pathname+window.location.search+r)}catch(t){}}),300))}onClose(){if(this.timer&&clearTimeout(this.timer),!0!==w.hasSilentClose)try{window.history.replaceState({},document.title,window.location.pathname+window.location.search+(this.origHash||""))}catch(t){}}attach(){this.instance.on("Carousel.ready",this.onChange),this.instance.on("Carousel.change",this.onChange),this.instance.on("close",this.onClose)}detach(){this.instance.off("Carousel.ready",this.onChange),this.instance.off("Carousel.change",this.onChange),this.instance.off("close",this.onClose)}static parseURL(){const t=window.location.hash.slice(1),e=t.split("-"),i=e[e.length-1],n=i&&/^\+?\d+$/.test(i)&&parseInt(e.pop()||"1",10)||1;return{hash:t,slug:e.join("-"),index:n}}static startFromUrl(){if(w.hasSilentClose=!1,It.getInstance()||!1===It.defaults.Hash)return;const{hash:t,slug:e,index:i}=w.parseURL();if(!e)return;let n=document.querySelector(`[data-slug="${t}"]`);if(n&&n.dispatchEvent(new CustomEvent("click",{bubbles:!0,cancelable:!0})),It.getInstance())return;const s=document.querySelectorAll(`[data-fancybox="${e}"]`);s.length&&(n=s[i-1],n&&n.dispatchEvent(new CustomEvent("click",{bubbles:!0,cancelable:!0})))}static destroy(){window.removeEventListener("hashchange",y,!1)}}function x(){window.addEventListener("hashchange",y,!1),setTimeout((()=>{w.startFromUrl()}),500)}Object.defineProperty(w,"defaults",{enumerable:!0,configurable:!0,writable:!0,value:{}}),Object.defineProperty(w,"hasSilentClose",{enumerable:!0,configurable:!0,writable:!0,value:!1}),a&&(/complete|interactive|loaded/.test(document.readyState)?x():document.addEventListener("DOMContentLoaded",x));const E=(t,e=1e4)=>(t=parseFloat(t+"")||0,Math.round((t+Number.EPSILON)*e)/e),S=function(t){if(!(t&&t instanceof Element&&t.offsetParent))return!1;const e=t.scrollHeight>t.clientHeight,i=window.getComputedStyle(t).overflowY,n=-1!==i.indexOf("hidden"),s=-1!==i.indexOf("visible");return e&&!n&&!s},P=function(t,e){return!(!t||t===document.body||e&&t===e)&&(S(t)?t:P(t.parentElement,e))},C=t=>`${t||""}`.split(" ").filter((t=>!!t)),M=(t,e,i)=>{C(e).forEach((e=>{t&&t.classList.toggle(e,i||!1)}))};class T{constructor(t){Object.defineProperty(this,"pageX",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"pageY",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"clientX",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"clientY",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"id",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"time",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"nativePointer",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),this.nativePointer=t,this.pageX=t.pageX,this.pageY=t.pageY,this.clientX=t.clientX,this.clientY=t.clientY,this.id=self.Touch&&t instanceof Touch?t.identifier:-1,this.time=Date.now()}}const O={passive:!1};class A{constructor(t,{start:e=(()=>!0),move:i=(()=>{}),end:n=(()=>{})}){Object.defineProperty(this,"element",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"startCallback",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"moveCallback",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"endCallback",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"currentPointers",{enumerable:!0,configurable:!0,writable:!0,value:[]}),Object.defineProperty(this,"startPointers",{enumerable:!0,configurable:!0,writable:!0,value:[]}),this.element=t,this.startCallback=e,this.moveCallback=i,this.endCallback=n;for(const t of["onPointerStart","onTouchStart","onMove","onTouchEnd","onPointerEnd","onWindowBlur"])this[t]=this[t].bind(this);this.element.addEventListener("mousedown",this.onPointerStart,O),this.element.addEventListener("touchstart",this.onTouchStart,O),this.element.addEventListener("touchmove",this.onMove,O),this.element.addEventListener("touchend",this.onTouchEnd),this.element.addEventListener("touchcancel",this.onTouchEnd)}onPointerStart(t){if(!t.buttons||0!==t.button)return;const e=new T(t);this.currentPointers.some((t=>t.id===e.id))||this.triggerPointerStart(e,t)&&(window.addEventListener("mousemove",this.onMove),window.addEventListener("mouseup",this.onPointerEnd),window.addEventListener("blur",this.onWindowBlur))}onTouchStart(t){for(const e of Array.from(t.changedTouches||[]))this.triggerPointerStart(new T(e),t);window.addEventListener("blur",this.onWindowBlur)}onMove(t){const e=this.currentPointers.slice(),i="changedTouches"in t?Array.from(t.changedTouches||[]).map((t=>new T(t))):[new T(t)],n=[];for(const t of i){const e=this.currentPointers.findIndex((e=>e.id===t.id));e<0||(n.push(t),this.currentPointers[e]=t)}n.length&&this.moveCallback(t,this.currentPointers.slice(),e)}onPointerEnd(t){t.buttons>0&&0!==t.button||(this.triggerPointerEnd(t,new T(t)),window.removeEventListener("mousemove",this.onMove),window.removeEventListener("mouseup",this.onPointerEnd),window.removeEventListener("blur",this.onWindowBlur))}onTouchEnd(t){for(const e of Array.from(t.changedTouches||[]))this.triggerPointerEnd(t,new T(e))}triggerPointerStart(t,e){return!!this.startCallback(e,t,this.currentPointers.slice())&&(this.currentPointers.push(t),this.startPointers.push(t),!0)}triggerPointerEnd(t,e){const i=this.currentPointers.findIndex((t=>t.id===e.id));i<0||(this.currentPointers.splice(i,1),this.startPointers.splice(i,1),this.endCallback(t,e,this.currentPointers.slice()))}onWindowBlur(){this.clear()}clear(){for(;this.currentPointers.length;){const t=this.currentPointers[this.currentPointers.length-1];this.currentPointers.splice(this.currentPointers.length-1,1),this.startPointers.splice(this.currentPointers.length-1,1),this.endCallback(new Event("touchend",{bubbles:!0,cancelable:!0,clientX:t.clientX,clientY:t.clientY}),t,this.currentPointers.slice())}}stop(){this.element.removeEventListener("mousedown",this.onPointerStart,O),this.element.removeEventListener("touchstart",this.onTouchStart,O),this.element.removeEventListener("touchmove",this.onMove,O),this.element.removeEventListener("touchend",this.onTouchEnd),this.element.removeEventListener("touchcancel",this.onTouchEnd),window.removeEventListener("mousemove",this.onMove),window.removeEventListener("mouseup",this.onPointerEnd),window.removeEventListener("blur",this.onWindowBlur)}}function z(t,e){return e?Math.sqrt(Math.pow(e.clientX-t.clientX,2)+Math.pow(e.clientY-t.clientY,2)):0}function L(t,e){return e?{clientX:(t.clientX+e.clientX)/2,clientY:(t.clientY+e.clientY)/2}:t}var R;!function(t){t[t.Init=0]="Init",t[t.Error=1]="Error",t[t.Ready=2]="Ready",t[t.Panning=3]="Panning",t[t.Mousemove=4]="Mousemove",t[t.Destroy=5]="Destroy"}(R||(R={}));const k=["a","b","c","d","e","f"],I={content:null,width:"auto",height:"auto",panMode:"drag",touch:!0,dragMinThreshold:3,lockAxis:!1,mouseMoveFactor:1,mouseMoveFriction:.12,zoom:!0,pinchToZoom:!0,panOnlyZoomed:"auto",minScale:1,maxScale:2,friction:.25,dragFriction:.35,decelFriction:.05,click:"toggleZoom",dblClick:!1,wheel:"zoom",wheelLimit:7,spinner:!0,bounds:"auto",infinite:!1,rubberband:!0,bounce:!0,maxVelocity:75,transformParent:!1,classes:{content:"f-panzoom__content",isLoading:"is-loading",canZoomIn:"can-zoom_in",canZoomOut:"can-zoom_out",isDraggable:"is-draggable",isDragging:"is-dragging",inFullscreen:"in-fullscreen",htmlHasFullscreen:"with-panzoom-in-fullscreen"},l10n:d},D=(t,e)=>{t&&C(e).forEach((e=>{t.classList.remove(e)}))},F=(t,e)=>{t&&C(e).forEach((e=>{t.classList.add(e)}))},j={a:1,b:0,c:0,d:1,e:0,f:0},H=1e5,B=1e3,_="mousemove",N="drag",W="content";let $=null,X=null;class Y extends b{get isTouchDevice(){return null===X&&(X=window.matchMedia("(hover: none)").matches),X}get isMobile(){return null===$&&($=/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)),$}get panMode(){return this.options.panMode!==_||this.isTouchDevice?N:_}get panOnlyZoomed(){const t=this.options.panOnlyZoomed;return"auto"===t?this.isTouchDevice:t}get isInfinite(){return this.option("infinite")}get angle(){return 180*Math.atan2(this.current.b,this.current.a)/Math.PI||0}get targetAngle(){return 180*Math.atan2(this.target.b,this.target.a)/Math.PI||0}get scale(){const{a:t,b:e}=this.current;return Math.sqrt(t*t+e*e)||1}get targetScale(){const{a:t,b:e}=this.target;return Math.sqrt(t*t+e*e)||1}get minScale(){return this.option("minScale")||1}get fullScale(){const{contentRect:t}=this;return t.fullWidth/t.fitWidth||1}get maxScale(){return this.fullScale*(this.option("maxScale")||1)||1}get coverScale(){const{containerRect:t,contentRect:e}=this,i=Math.max(t.height/e.fitHeight,t.width/e.fitWidth)||1;return Math.min(this.fullScale,i)}get isScaling(){return Math.abs(this.targetScale-this.scale)>1e-5&&!this.isResting}get isContentLoading(){const t=this.content;return!!(t&&t instanceof HTMLImageElement)&&!t.complete}get isResting(){if(this.isBouncingX||this.isBouncingY)return!1;for(const t of k){const e="e"==t||"f"===t?.001:1e-5;if(Math.abs(this.target[t]-this.current[t])>e)return!1}return!(!this.ignoreBounds&&!this.checkBounds().inBounds)}constructor(t,e={},i={}){var s;if(super(e),Object.defineProperty(this,"pointerTracker",{enumerable:!0,configurable:!0,writable:!0,value:null}),Object.defineProperty(this,"resizeObserver",{enumerable:!0,configurable:!0,writable:!0,value:null}),Object.defineProperty(this,"updateTimer",{enumerable:!0,configurable:!0,writable:!0,value:null}),Object.defineProperty(this,"clickTimer",{enumerable:!0,configurable:!0,writable:!0,value:null}),Object.defineProperty(this,"rAF",{enumerable:!0,configurable:!0,writable:!0,value:null}),Object.defineProperty(this,"isTicking",{enumerable:!0,configurable:!0,writable:!0,value:!1}),Object.defineProperty(this,"friction",{enumerable:!0,configurable:!0,writable:!0,value:0}),Object.defineProperty(this,"ignoreBounds",{enumerable:!0,configurable:!0,writable:!0,value:!1}),Object.defineProperty(this,"isBouncingX",{enumerable:!0,configurable:!0,writable:!0,value:!1}),Object.defineProperty(this,"isBouncingY",{enumerable:!0,configurable:!0,writable:!0,value:!1}),Object.defineProperty(this,"clicks",{enumerable:!0,configurable:!0,writable:!0,value:0}),Object.defineProperty(this,"trackingPoints",{enumerable:!0,configurable:!0,writable:!0,value:[]}),Object.defineProperty(this,"pwt",{enumerable:!0,configurable:!0,writable:!0,value:0}),Object.defineProperty(this,"cwd",{enumerable:!0,configurable:!0,writable:!0,value:0}),Object.defineProperty(this,"pmme",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"state",{enumerable:!0,configurable:!0,writable:!0,value:R.Init}),Object.defineProperty(this,"isDragging",{enumerable:!0,configurable:!0,writable:!0,value:!1}),Object.defineProperty(this,"container",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"content",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"spinner",{enumerable:!0,configurable:!0,writable:!0,value:null}),Object.defineProperty(this,"containerRect",{enumerable:!0,configurable:!0,writable:!0,value:{width:0,height:0,innerWidth:0,innerHeight:0}}),Object.defineProperty(this,"contentRect",{enumerable:!0,configurable:!0,writable:!0,value:{top:0,right:0,bottom:0,left:0,fullWidth:0,fullHeight:0,fitWidth:0,fitHeight:0,width:0,height:0}}),Object.defineProperty(this,"dragStart",{enumerable:!0,configurable:!0,writable:!0,value:{x:0,y:0,top:0,left:0,time:0}}),Object.defineProperty(this,"dragOffset",{enumerable:!0,configurable:!0,writable:!0,value:{x:0,y:0,time:0}}),Object.defineProperty(this,"current",{enumerable:!0,configurable:!0,writable:!0,value:Object.assign({},j)}),Object.defineProperty(this,"target",{enumerable:!0,configurable:!0,writable:!0,value:Object.assign({},j)}),Object.defineProperty(this,"velocity",{enumerable:!0,configurable:!0,writable:!0,value:{a:0,b:0,c:0,d:0,e:0,f:0}}),Object.defineProperty(this,"lockedAxis",{enumerable:!0,configurable:!0,writable:!0,value:!1}),!t)throw new Error("Container Element Not Found");this.container=t,this.initContent(),this.attachPlugins(Object.assign(Object.assign({},Y.Plugins),i)),this.emit("init");const o=this.content;if(o.addEventListener("load",this.onLoad),o.addEventListener("error",this.onError),this.isContentLoading){if(this.option("spinner")){t.classList.add(this.cn("isLoading"));const e=n(h);!t.contains(o)||o.parentElement instanceof HTMLPictureElement?this.spinner=t.appendChild(e):this.spinner=(null===(s=o.parentElement)||void 0===s?void 0:s.insertBefore(e,o))||null}this.emit("beforeLoad")}else queueMicrotask((()=>{this.enable()}))}initContent(){const{container:t}=this,e=this.cn(W);let i=this.option(W)||t.querySelector(`.${e}`);if(i||(i=t.querySelector("img,picture")||t.firstElementChild,i&&F(i,e)),i instanceof HTMLPictureElement&&(i=i.querySelector("img")),!i)throw new Error("No content found");this.content=i}onLoad(){this.spinner&&(this.spinner.remove(),this.spinner=null),this.option("spinner")&&this.container.classList.remove(this.cn("isLoading")),this.emit("afterLoad"),this.state===R.Init?this.enable():this.updateMetrics()}onError(){this.state!==R.Destroy&&(this.spinner&&(this.spinner.remove(),this.spinner=null),this.stop(),this.detachEvents(),this.state=R.Error,this.emit("error"))}attachObserver(){var t;const e=()=>Math.abs(this.containerRect.width-this.container.getBoundingClientRect().width)>.1||Math.abs(this.containerRect.height-this.container.getBoundingClientRect().height)>.1;this.resizeObserver||void 0===window.ResizeObserver||(this.resizeObserver=new ResizeObserver((()=>{this.updateTimer||(e()?(this.onResize(),this.isMobile&&(this.updateTimer=setTimeout((()=>{e()&&this.onResize(),this.updateTimer=null}),500))):this.updateTimer&&(clearTimeout(this.updateTimer),this.updateTimer=null))}))),null===(t=this.resizeObserver)||void 0===t||t.observe(this.container)}detachObserver(){var t;null===(t=this.resizeObserver)||void 0===t||t.disconnect()}attachEvents(){const{container:t}=this;t.addEventListener("click",this.onClick,{passive:!1,capture:!1}),t.addEventListener("wheel",this.onWheel,{passive:!1}),this.pointerTracker=new A(t,{start:this.onPointerDown,move:this.onPointerMove,end:this.onPointerUp}),document.addEventListener(_,this.onMouseMove)}detachEvents(){var t;const{container:e}=this;e.removeEventListener("click",this.onClick,{passive:!1,capture:!1}),e.removeEventListener("wheel",this.onWheel,{passive:!1}),null===(t=this.pointerTracker)||void 0===t||t.stop(),this.pointerTracker=null,document.removeEventListener(_,this.onMouseMove),document.removeEventListener("keydown",this.onKeydown,!0),this.clickTimer&&(clearTimeout(this.clickTimer),this.clickTimer=null),this.updateTimer&&(clearTimeout(this.updateTimer),this.updateTimer=null)}animate(){const t=this.friction;this.setTargetForce();const e=this.option("maxVelocity");for(const i of k)t?(this.velocity[i]*=1-t,e&&!this.isScaling&&(this.velocity[i]=Math.max(Math.min(this.velocity[i],e),-1*e)),this.current[i]+=this.velocity[i]):this.current[i]=this.target[i];this.setTransform(),this.setEdgeForce(),!this.isResting||this.isDragging?this.rAF=requestAnimationFrame((()=>this.animate())):this.stop("current")}setTargetForce(){for(const t of k)"e"===t&&this.isBouncingX||"f"===t&&this.isBouncingY||(this.velocity[t]=(1/(1-this.friction)-1)*(this.target[t]-this.current[t]))}checkBounds(t=0,e=0){const{current:i}=this,n=i.e+t,s=i.f+e,o=this.getBounds(),{x:a,y:r}=o,l=a.min,c=a.max,h=r.min,d=r.max;let u=0,p=0;return l!==1/0&&n<l?u=l-n:c!==1/0&&n>c&&(u=c-n),h!==1/0&&s<h?p=h-s:d!==1/0&&s>d&&(p=d-s),Math.abs(u)<.001&&(u=0),Math.abs(p)<.001&&(p=0),Object.assign(Object.assign({},o),{xDiff:u,yDiff:p,inBounds:!u&&!p})}clampTargetBounds(){const{target:t}=this,{x:e,y:i}=this.getBounds();e.min!==1/0&&(t.e=Math.max(t.e,e.min)),e.max!==1/0&&(t.e=Math.min(t.e,e.max)),i.min!==1/0&&(t.f=Math.max(t.f,i.min)),i.max!==1/0&&(t.f=Math.min(t.f,i.max))}calculateContentDim(t=this.current){const{content:e,contentRect:i}=this,{fitWidth:n,fitHeight:s,fullWidth:o,fullHeight:a}=i;let r=o,l=a;if(this.option("zoom")||0!==this.angle){const i=!(e instanceof HTMLImageElement)&&("none"===window.getComputedStyle(e).maxWidth||"none"===window.getComputedStyle(e).maxHeight),c=i?o:n,h=i?a:s,d=this.getMatrix(t),u=new DOMPoint(0,0).matrixTransform(d),p=new DOMPoint(0+c,0).matrixTransform(d),f=new DOMPoint(0+c,0+h).matrixTransform(d),m=new DOMPoint(0,0+h).matrixTransform(d),g=Math.abs(f.x-u.x),b=Math.abs(f.y-u.y),v=Math.abs(m.x-p.x),y=Math.abs(m.y-p.y);r=Math.max(g,v),l=Math.max(b,y)}return{contentWidth:r,contentHeight:l}}setEdgeForce(){if(this.ignoreBounds||this.isDragging||this.panMode===_||this.targetScale<this.scale)return this.isBouncingX=!1,void(this.isBouncingY=!1);const{target:t}=this,{x:e,y:i,xDiff:n,yDiff:s}=this.checkBounds();const o=this.option("maxVelocity");let a=this.velocity.e,r=this.velocity.f;0!==n?(this.isBouncingX=!0,n*a<=0?a+=.14*n:(a=.14*n,e.min!==1/0&&(this.target.e=Math.max(t.e,e.min)),e.max!==1/0&&(this.target.e=Math.min(t.e,e.max))),o&&(a=Math.max(Math.min(a,o),-1*o))):this.isBouncingX=!1,0!==s?(this.isBouncingY=!0,s*r<=0?r+=.14*s:(r=.14*s,i.min!==1/0&&(this.target.f=Math.max(t.f,i.min)),i.max!==1/0&&(this.target.f=Math.min(t.f,i.max))),o&&(r=Math.max(Math.min(r,o),-1*o))):this.isBouncingY=!1,this.isBouncingX&&(this.velocity.e=a),this.isBouncingY&&(this.velocity.f=r)}enable(){const{content:t}=this,e=new DOMMatrixReadOnly(window.getComputedStyle(t).transform);for(const t of k)this.current[t]=this.target[t]=e[t];this.updateMetrics(),this.attachObserver(),this.attachEvents(),this.state=R.Ready,this.emit("ready")}onClick(t){var e;this.isDragging&&(null===(e=this.pointerTracker)||void 0===e||e.clear(),this.trackingPoints=[],this.startDecelAnim());const i=t.target;if(!i||t.defaultPrevented)return;if(i&&i.hasAttribute("disabled"))return t.preventDefault(),void t.stopPropagation();if((()=>{const t=window.getSelection();return t&&"Range"===t.type})()&&!i.closest("button"))return;const n=i.closest("[data-panzoom-action]"),o=i.closest("[data-panzoom-change]"),a=n||o,r=a&&s(a)?a.dataset:null;if(r){const e=r.panzoomChange,i=r.panzoomAction;if((e||i)&&t.preventDefault(),e){let t={};try{t=JSON.parse(e)}catch(t){console&&console.warn("The given data was not valid JSON")}return void this.applyChange(t)}if(i)return void(this[i]&&this[i]())}if(Math.abs(this.dragOffset.x)>3||Math.abs(this.dragOffset.y)>3)return t.preventDefault(),void t.stopPropagation();const l=this.content.getBoundingClientRect();if(this.dragStart.time&&!this.canZoomOut()&&(Math.abs(l.x-this.dragStart.x)>2||Math.abs(l.y-this.dragStart.y)>2))return;this.dragStart.time=0;const c=e=>{this.option("zoom")&&e&&"string"==typeof e&&/(iterateZoom)|(toggle(Zoom|Full|Cover|Max)|(zoomTo(Fit|Cover|Max)))/.test(e)&&"function"==typeof this[e]&&(t.preventDefault(),this[e]({event:t}))},h=this.option("click",t),d=this.option("dblClick",t);d?(this.clicks++,1==this.clicks&&(this.clickTimer=setTimeout((()=>{1===this.clicks?(this.emit("click",t),!t.defaultPrevented&&h&&c(h)):(this.emit("dblClick",t),t.defaultPrevented||c(d)),this.clicks=0,this.clickTimer=null}),350))):(this.emit("click",t),!t.defaultPrevented&&h&&c(h))}addTrackingPoint(t){const e=this.trackingPoints.filter((t=>t.time>Date.now()-100));e.push(t),this.trackingPoints=e}onPointerDown(t,e,i){var n;this.pwt=0,this.dragOffset={x:0,y:0,time:0},this.trackingPoints=[];const s=this.content.getBoundingClientRect();if(this.dragStart={x:s.x,y:s.y,top:s.top,left:s.left,time:Date.now()},this.clickTimer)return!1;if(this.panMode===_&&this.targetScale>1)return t.preventDefault(),t.stopPropagation(),!1;if(!i.length){const e=t.composedPath()[0];if(["A","TEXTAREA","OPTION","INPUT","SELECT","VIDEO"].includes(e.nodeName)||e.closest("[contenteditable]")||e.closest("[data-selectable]")||e.closest("[data-panzoom-change]")||e.closest("[data-panzoom-action]"))return!1;null===(n=window.getSelection())||void 0===n||n.removeAllRanges()}if("mousedown"===t.type)t.preventDefault();else if(Math.abs(this.velocity.a)>.3)return!1;return this.target.e=this.current.e,this.target.f=this.current.f,this.stop(),this.isDragging||(this.isDragging=!0,this.addTrackingPoint(e),this.emit("touchStart",t)),!0}onPointerMove(t,e,i){if(!1===this.option("touch",t))return;if(!this.isDragging)return;if(e.length<2&&this.panOnlyZoomed&&E(this.targetScale)<=E(this.minScale))return;if(this.emit("touchMove",t),t.defaultPrevented)return;this.addTrackingPoint(e[0]);const{content:n}=this,s=L(i[0],i[1]),o=L(e[0],e[1]);let a=0,r=0;if(e.length>1){const t=n.getBoundingClientRect();a=s.clientX-t.left-.5*t.width,r=s.clientY-t.top-.5*t.height}const l=z(i[0],i[1]),c=z(e[0],e[1]);let h=l?c/l:1,d=o.clientX-s.clientX,u=o.clientY-s.clientY;this.dragOffset.x+=d,this.dragOffset.y+=u,this.dragOffset.time=Date.now()-this.dragStart.time;let p=E(this.targetScale)===E(this.minScale)&&this.option("lockAxis");if(p&&!this.lockedAxis)if("xy"===p||"y"===p||"touchmove"===t.type){if(Math.abs(this.dragOffset.x)<6&&Math.abs(this.dragOffset.y)<6)return void t.preventDefault();const e=Math.abs(180*Math.atan2(this.dragOffset.y,this.dragOffset.x)/Math.PI);this.lockedAxis=e>45&&e<135?"y":"x",this.dragOffset.x=0,this.dragOffset.y=0,d=0,u=0}else this.lockedAxis=p;if(P(t.target,this.content)&&(p="x",this.dragOffset.y=0),p&&"xy"!==p&&this.lockedAxis!==p&&E(this.targetScale)===E(this.minScale))return;t.cancelable&&t.preventDefault(),this.container.classList.add(this.cn("isDragging"));const f=this.checkBounds(d,u);this.option("rubberband")?("x"!==this.isInfinite&&(f.xDiff>0&&d<0||f.xDiff<0&&d>0)&&(d*=Math.max(0,.5-Math.abs(.75/this.contentRect.fitWidth*f.xDiff))),"y"!==this.isInfinite&&(f.yDiff>0&&u<0||f.yDiff<0&&u>0)&&(u*=Math.max(0,.5-Math.abs(.75/this.contentRect.fitHeight*f.yDiff)))):(f.xDiff&&(d=0),f.yDiff&&(u=0));const m=this.targetScale,g=this.minScale,b=this.maxScale;m<.5*g&&(h=Math.max(h,g)),m>1.5*b&&(h=Math.min(h,b)),"y"===this.lockedAxis&&E(m)===E(g)&&(d=0),"x"===this.lockedAxis&&E(m)===E(g)&&(u=0),this.applyChange({originX:a,originY:r,panX:d,panY:u,scale:h,friction:this.option("dragFriction"),ignoreBounds:!0})}onPointerUp(t,e,i){if(i.length)return this.dragOffset.x=0,this.dragOffset.y=0,void(this.trackingPoints=[]);this.container.classList.remove(this.cn("isDragging")),this.isDragging&&(this.addTrackingPoint(e),this.panOnlyZoomed&&this.contentRect.width-this.contentRect.fitWidth<1&&this.contentRect.height-this.contentRect.fitHeight<1&&(this.trackingPoints=[]),P(t.target,this.content)&&"y"===this.lockedAxis&&(this.trackingPoints=[]),this.emit("touchEnd",t),this.isDragging=!1,this.lockedAxis=!1,this.state!==R.Destroy&&(t.defaultPrevented||this.startDecelAnim()))}startDecelAnim(){const t=this.isScaling;this.rAF&&(cancelAnimationFrame(this.rAF),this.rAF=null),this.isBouncingX=!1,this.isBouncingY=!1;for(const t of k)this.velocity[t]=0;this.target.e=this.current.e,this.target.f=this.current.f,D(this.container,"is-scaling"),D(this.container,"is-animating"),this.isTicking=!1;const{trackingPoints:e}=this,i=e[0],n=e[e.length-1];let s=0,o=0,a=0;n&&i&&(s=n.clientX-i.clientX,o=n.clientY-i.clientY,a=n.time-i.time);let r=0,l=0,c=0,h=0,d=this.option("decelFriction");const u=this.targetScale;if(a>0){c=Math.abs(s)>3?s/(a/30):0,h=Math.abs(o)>3?o/(a/30):0;const t=this.option("maxVelocity");t&&(c=Math.max(Math.min(c,t),-1*t),h=Math.max(Math.min(h,t),-1*t))}c&&(r=c/(1/(1-d)-1)),h&&(l=h/(1/(1-d)-1)),("y"===this.option("lockAxis")||"xy"===this.option("lockAxis")&&"y"===this.lockedAxis&&E(u)===this.minScale)&&(r=c=0),("x"===this.option("lockAxis")||"xy"===this.option("lockAxis")&&"x"===this.lockedAxis&&E(u)===this.minScale)&&(l=h=0);const p=this.dragOffset.x,f=this.dragOffset.y,m=this.option("dragMinThreshold")||0;Math.abs(p)<m&&Math.abs(f)<m&&(r=l=0,c=h=0),(u<this.minScale-1e-5||u>this.maxScale+1e-5||t&&!r&&!l)&&(d=.35),this.applyChange({panX:r,panY:l,friction:d}),this.emit("decel",c,h,p,f)}onWheel(t){var e=[-t.deltaX||0,-t.deltaY||0,-t.detail||0].reduce((function(t,e){return Math.abs(e)>Math.abs(t)?e:t}));const i=Math.max(-1,Math.min(1,e));if(this.emit("wheel",t,i),this.panMode===_)return;if(t.defaultPrevented)return;const n=this.option("wheel");"pan"===n?(t.preventDefault(),this.panOnlyZoomed&&!this.canZoomOut()||this.applyChange({panX:2*-t.deltaX,panY:2*-t.deltaY,bounce:!1})):"zoom"===n&&!1!==this.option("zoom")&&this.zoomWithWheel(t)}onMouseMove(t){this.panWithMouse(t)}onKeydown(t){"Escape"===t.key&&this.toggleFS()}onResize(){this.updateMetrics(),this.checkBounds().inBounds||this.requestTick()}setTransform(){this.emit("beforeTransform");const{current:t,target:e,content:i,contentRect:n}=this,s=Object.assign({},j);for(const i of k){const n="e"==i||"f"===i?B:H;s[i]=E(t[i],n),Math.abs(e[i]-t[i])<("e"==i||"f"===i?.51:.001)&&(t[i]=e[i])}let{a:o,b:a,c:r,d:l,e:c,f:h}=s,d=`matrix(${o}, ${a}, ${r}, ${l}, ${c}, ${h})`,u=i.parentElement instanceof HTMLPictureElement?i.parentElement:i;if(this.option("transformParent")&&(u=u.parentElement||u),u.style.transform===d)return;u.style.transform=d;const{contentWidth:p,contentHeight:f}=this.calculateContentDim();n.width=p,n.height=f,this.emit("afterTransform")}updateMetrics(t=!1){if(!this||this.state===R.Destroy)return;if(this.isContentLoading)return;const{container:e,content:i}=this,n=i instanceof HTMLImageElement,s=e.getBoundingClientRect(),o=getComputedStyle(this.container),a=s.width,r=s.height,l=parseFloat(o.paddingTop)+parseFloat(o.paddingBottom),c=a-(parseFloat(o.paddingLeft)+parseFloat(o.paddingRight)),h=r-l;this.containerRect={width:a,height:r,innerWidth:c,innerHeight:h};let d=this.option("width")||"auto",u=this.option("height")||"auto";"auto"===d&&(d=parseFloat(i.dataset.width||"")||(t=>{let e=0;return e=t instanceof HTMLImageElement?t.naturalWidth:t instanceof SVGElement?t.width.baseVal.value:Math.max(t.offsetWidth,t.scrollWidth),e||0})(i)),"auto"===u&&(u=parseFloat(i.dataset.height||"")||(t=>{let e=0;return e=t instanceof HTMLImageElement?t.naturalHeight:t instanceof SVGElement?t.height.baseVal.value:Math.max(t.offsetHeight,t.scrollHeight),e||0})(i));let p=i.parentElement instanceof HTMLPictureElement?i.parentElement:i;this.option("transformParent")&&(p=p.parentElement||p);const f=p.getAttribute("style")||"";p.style.setProperty("transform","none","important"),n&&(p.style.width="",p.style.height=""),p.offsetHeight;const m=i.getBoundingClientRect();let g=m.width,b=m.height,v=0,y=0;n&&(Math.abs(d-g)>1||Math.abs(u-b)>1)&&({width:g,height:b,top:v,left:y}=((t,e,i,n)=>{const s=i/n;return s>t/e?(i=t,n=t/s):(i=e*s,n=e),{width:i,height:n,top:.5*(e-n),left:.5*(t-i)}})(g,b,d,u)),this.contentRect=Object.assign(Object.assign({},this.contentRect),{top:m.top-s.top+v,bottom:s.bottom-m.bottom+v,left:m.left-s.left+y,right:s.right-m.right+y,fitWidth:g,fitHeight:b,width:g,height:b,fullWidth:d,fullHeight:u}),p.style.cssText=f,n&&(p.style.width=`${g}px`,p.style.height=`${b}px`),this.setTransform(),!0!==t&&this.emit("refresh"),this.ignoreBounds||(E(this.targetScale)<E(this.minScale)?this.zoomTo(this.minScale,{friction:0}):this.targetScale>this.maxScale?this.zoomTo(this.maxScale,{friction:0}):this.state===R.Init||this.checkBounds().inBounds||this.requestTick()),this.updateControls()}getBounds(){const t=this.option("bounds");if("auto"!==t)return t;const{contentWidth:e,contentHeight:i}=this.calculateContentDim(this.target);let n=0,s=0,o=0,a=0;const r=this.option("infinite");if(!0===r||this.lockedAxis&&r===this.lockedAxis)n=-1/0,o=1/0,s=-1/0,a=1/0;else{let{containerRect:t,contentRect:r}=this,l=E(this.contentRect.fitWidth*this.targetScale,B),c=E(this.contentRect.fitHeight*this.targetScale,B),{innerWidth:h,innerHeight:d}=t;if(this.containerRect.width===l&&(h=t.width),this.containerRect.width===c&&(d=t.height),e>h){o=.5*(e-h),n=-1*o;let t=.5*(r.right-r.left);n+=t,o+=t}if(this.contentRect.fitWidth>h&&e<h&&(n-=.5*(this.contentRect.fitWidth-h),o-=.5*(this.contentRect.fitWidth-h)),i>d){a=.5*(i-d),s=-1*a;let t=.5*(r.bottom-r.top);s+=t,a+=t}this.contentRect.fitHeight>d&&i<d&&(n-=.5*(this.contentRect.fitHeight-d),o-=.5*(this.contentRect.fitHeight-d))}return{x:{min:n,max:o},y:{min:s,max:a}}}updateControls(){const t=this,e=t.container,{panMode:i,contentRect:n,fullScale:s,targetScale:o,coverScale:a,maxScale:r,minScale:l}=t;let c={toggleMax:o-l<.5*(r-l)?r:l,toggleCover:o-l<.5*(a-l)?a:l,toggleZoom:o-l<.5*(s-l)?s:l}[t.option("click")||""]||l,h=t.canZoomIn(),d=t.canZoomOut(),u=d&&i===N;E(o)<E(l)&&!this.panOnlyZoomed&&(u=!0),(E(n.width,1)>E(n.fitWidth,1)||E(n.height,1)>E(n.fitHeight,1))&&(u=!0),E(n.width*o,1)<E(n.fitWidth,1)&&(u=!1),i===_&&(u=!1);let p=h&&E(c)>E(o),f=!p&&!u&&d&&E(c)<E(o);M(e,this.cn("canZoomIn"),p),M(e,this.cn("canZoomOut"),f),M(e,this.cn("isDraggable"),u);for(const t of e.querySelectorAll('[data-panzoom-action="zoomIn"]'))h?(t.removeAttribute("disabled"),t.removeAttribute("tabindex")):(t.setAttribute("disabled",""),t.setAttribute("tabindex","-1"));for(const t of e.querySelectorAll('[data-panzoom-action="zoomOut"]'))d?(t.removeAttribute("disabled"),t.removeAttribute("tabindex")):(t.setAttribute("disabled",""),t.setAttribute("tabindex","-1"));for(const t of e.querySelectorAll('[data-panzoom-action="toggleZoom"],[data-panzoom-action="iterateZoom"]')){h||d?(t.removeAttribute("disabled"),t.removeAttribute("tabindex")):(t.setAttribute("disabled",""),t.setAttribute("tabindex","-1"));const e=t.querySelector("g");e&&(e.style.display=h?"":"none")}}panTo({x:t=this.target.e,y:e=this.target.f,scale:i=this.targetScale,friction:n=this.option("friction"),angle:s=0,originX:o=0,originY:a=0,flipX:r=!1,flipY:l=!1,ignoreBounds:c=!1}){this.state!==R.Destroy&&this.applyChange({panX:t-this.target.e,panY:e-this.target.f,scale:i/this.targetScale,angle:s,originX:o,originY:a,friction:n,flipX:r,flipY:l,ignoreBounds:c})}applyChange({panX:t=0,panY:e=0,scale:i=1,angle:n=0,originX:s=-this.current.e,originY:o=-this.current.f,friction:a=this.option("friction"),flipX:r=!1,flipY:l=!1,ignoreBounds:c=!1,bounce:h=this.option("bounce")}){if(this.state===R.Destroy)return;this.rAF&&(cancelAnimationFrame(this.rAF),this.rAF=null),this.friction=a||0,this.ignoreBounds=c;const{current:d}=this,u=d.e,p=d.f,f=this.getMatrix(this.target);let m=(new DOMMatrix).translate(u,p).translate(s,o).translate(t,e);if(this.option("zoom")){if(!c){const t=this.targetScale,e=this.minScale,n=this.maxScale;t*i<e&&(i=e/t),t*i>n&&(i=n/t)}m=m.scale(i)}m=m.translate(-s,-o).translate(-u,-p).multiply(f),n&&(m=m.rotate(n)),r&&(m=m.scale(-1,1)),l&&(m=m.scale(1,-1));for(const t of k)"e"!==t&&"f"!==t&&(m[t]>this.minScale+1e-5||m[t]<this.minScale-1e-5)?this.target[t]=m[t]:this.target[t]=E(m[t],B);(this.targetScale<this.scale||Math.abs(i-1)>.1||this.panMode===_||!1===h)&&!c&&this.clampTargetBounds(),this.isResting||(this.state=R.Panning,this.requestTick())}stop(t=!1){if(this.state===R.Init||this.state===R.Destroy)return;const e=this.isTicking;this.rAF&&(cancelAnimationFrame(this.rAF),this.rAF=null),this.isBouncingX=!1,this.isBouncingY=!1;for(const e of k)this.velocity[e]=0,"current"===t?this.current[e]=this.target[e]:"target"===t&&(this.target[e]=this.current[e]);this.setTransform(),D(this.container,"is-scaling"),D(this.container,"is-animating"),this.isTicking=!1,this.state=R.Ready,e&&(this.emit("endAnimation"),this.updateControls())}requestTick(){this.isTicking||(this.emit("startAnimation"),this.updateControls(),F(this.container,"is-animating"),this.isScaling&&F(this.container,"is-scaling")),this.isTicking=!0,this.rAF||(this.rAF=requestAnimationFrame((()=>this.animate())))}panWithMouse(t,e=this.option("mouseMoveFriction")){if(this.pmme=t,this.panMode!==_||!t)return;if(E(this.targetScale)<=E(this.minScale))return;this.emit("mouseMove",t);const{container:i,containerRect:n,contentRect:s}=this,o=n.width,a=n.height,r=i.getBoundingClientRect(),l=(t.clientX||0)-r.left,c=(t.clientY||0)-r.top;let{contentWidth:h,contentHeight:d}=this.calculateContentDim(this.target);const u=this.option("mouseMoveFactor");u>1&&(h!==o&&(h*=u),d!==a&&(d*=u));let p=.5*(h-o)-l/o*100/100*(h-o);p+=.5*(s.right-s.left);let f=.5*(d-a)-c/a*100/100*(d-a);f+=.5*(s.bottom-s.top),this.applyChange({panX:p-this.target.e,panY:f-this.target.f,friction:e})}zoomWithWheel(t){if(this.state===R.Destroy||this.state===R.Init)return;const e=Date.now();if(e-this.pwt<45)return void t.preventDefault();this.pwt=e;var i=[-t.deltaX||0,-t.deltaY||0,-t.detail||0].reduce((function(t,e){return Math.abs(e)>Math.abs(t)?e:t}));const n=Math.max(-1,Math.min(1,i)),{targetScale:s,maxScale:o,minScale:a}=this;let r=s*(100+45*n)/100;E(r)<E(a)&&E(s)<=E(a)?(this.cwd+=Math.abs(n),r=a):E(r)>E(o)&&E(s)>=E(o)?(this.cwd+=Math.abs(n),r=o):(this.cwd=0,r=Math.max(Math.min(r,o),a)),this.cwd>this.option("wheelLimit")||(t.preventDefault(),E(r)!==E(s)&&this.zoomTo(r,{event:t}))}canZoomIn(){return this.option("zoom")&&(E(this.contentRect.width,1)<E(this.contentRect.fitWidth,1)||E(this.targetScale)<E(this.maxScale))}canZoomOut(){return this.option("zoom")&&E(this.targetScale)>E(this.minScale)}zoomIn(t=1.25,e){this.zoomTo(this.targetScale*t,e)}zoomOut(t=.8,e){this.zoomTo(this.targetScale*t,e)}zoomToFit(t){this.zoomTo("fit",t)}zoomToCover(t){this.zoomTo("cover",t)}zoomToFull(t){this.zoomTo("full",t)}zoomToMax(t){this.zoomTo("max",t)}toggleZoom(t){this.zoomTo(this.targetScale-this.minScale<.5*(this.fullScale-this.minScale)?"full":"fit",t)}toggleMax(t){this.zoomTo(this.targetScale-this.minScale<.5*(this.maxScale-this.minScale)?"max":"fit",t)}toggleCover(t){this.zoomTo(this.targetScale-this.minScale<.5*(this.coverScale-this.minScale)?"cover":"fit",t)}iterateZoom(t){this.zoomTo("next",t)}zoomTo(t=1,{friction:e="auto",originX:i=0,originY:n=0,event:s}={}){if(this.isContentLoading||this.state===R.Destroy)return;const{targetScale:o}=this;this.stop();let a=1;if(this.panMode===_&&(s=this.pmme||s),s){const t=this.content.getBoundingClientRect(),e=s.clientX||0,o=s.clientY||0;i=e-t.left-.5*t.width,n=o-t.top-.5*t.height}const r=this.fullScale,l=this.maxScale;let c=this.coverScale;"number"==typeof t?a=t/o:("next"===t&&(r-c<.2&&(c=r),t=o<r-1e-5?"full":o<l-1e-5?"max":"fit"),a="full"===t?r/o||1:"cover"===t?c/o||1:"max"===t?l/o||1:1/o||1),e="auto"===e?a>1?.15:.25:e,this.applyChange({scale:a,originX:i,originY:n,friction:e}),s&&this.panMode===_&&this.panWithMouse(s,e)}rotateCCW(){this.applyChange({angle:-90})}rotateCW(){this.applyChange({angle:90})}flipX(){this.applyChange({flipX:!0})}flipY(){this.applyChange({flipY:!0})}fitX(){this.stop("target");const{containerRect:t,contentRect:e,target:i}=this;this.applyChange({panX:.5*t.width-(e.left+.5*e.fitWidth)-i.e,panY:.5*t.height-(e.top+.5*e.fitHeight)-i.f,scale:t.width/e.fitWidth/this.targetScale,originX:0,originY:0,ignoreBounds:!0})}fitY(){this.stop("target");const{containerRect:t,contentRect:e,target:i}=this;this.applyChange({panX:.5*t.width-(e.left+.5*e.fitWidth)-i.e,panY:.5*t.innerHeight-(e.top+.5*e.fitHeight)-i.f,scale:t.height/e.fitHeight/this.targetScale,originX:0,originY:0,ignoreBounds:!0})}toggleFS(){const{container:t}=this,e=this.cn("inFullscreen"),i=this.cn("htmlHasFullscreen");t.classList.toggle(e);const n=t.classList.contains(e);n?(document.documentElement.classList.add(i),document.addEventListener("keydown",this.onKeydown,!0)):(document.documentElement.classList.remove(i),document.removeEventListener("keydown",this.onKeydown,!0)),this.updateMetrics(),this.emit(n?"enterFS":"exitFS")}getMatrix(t=this.current){const{a:e,b:i,c:n,d:s,e:o,f:a}=t;return new DOMMatrix([e,i,n,s,o,a])}reset(t){if(this.state!==R.Init&&this.state!==R.Destroy){this.stop("current");for(const t of k)this.target[t]=j[t];this.target.a=this.minScale,this.target.d=this.minScale,this.clampTargetBounds(),this.isResting||(this.friction=void 0===t?this.option("friction"):t,this.state=R.Panning,this.requestTick())}}destroy(){this.stop(),this.state=R.Destroy,this.detachEvents(),this.detachObserver();const{container:t,content:e}=this,i=this.option("classes")||{};for(const e of Object.values(i))t.classList.remove(e+"");e&&(e.removeEventListener("load",this.onLoad),e.removeEventListener("error",this.onError)),this.detachPlugins()}}Object.defineProperty(Y,"defaults",{enumerable:!0,configurable:!0,writable:!0,value:I}),Object.defineProperty(Y,"Plugins",{enumerable:!0,configurable:!0,writable:!0,value:{}});const q=t=>new Promise(((e,i)=>{const n=new Image;n.onload=e,n.onerror=i,n.src=t}));class Z extends v{onCreateSlide(t,e,i){const n=this.instance,s=n.optionFor(i,"src")||"",{el:o,type:a}=i;o&&"image"===a&&"string"==typeof s&&this.setContent(i,s).then((t=>{if(n.isClosing())return;const e=i.contentEl,s=i.imageEl,o=i.thumbElSrc,a=this.optionFor(i,"initialSize"),r=this.optionFor(i,"zoom"),l={event:n.prevMouseMoveEvent||n.options.event,friction:r?.12:0};if(e&&s&&o&&n.isOpeningSlide(i)&&this.getZoomInfo(i)){let t=document.createElement("img");F(t,"fancybox-ghost"),e.appendChild(t),t.src=o,setTimeout((()=>{n.animate(t,"f-fadeFastOut",(()=>{t&&(t.remove(),t=null)}))}),333),q(o).then((()=>{i.state=f.Opening,this.instance.emit("reveal",i),this.zoomIn(i).then((()=>{this.instance.done(i)}),(()=>{n.hideLoading(i)}))}),(()=>{n.hideLoading(i),n.revealContent(i)}))}else{let e=n.optionFor(i,"showClass")||void 0,s=!0;n.isOpeningSlide(i)&&("full"===a?t.zoomToFull(l):"cover"===a?t.zoomToCover(l):"max"===a?t.zoomToMax(l):s=!1,t.stop("current")),s&&e&&(e="f-fadeIn"),n.revealContent(i,e)}}),(()=>{n.setError(i,"{{IMAGE_ERROR}}")}))}onRemoveSlide(t,e,i){i.panzoom&&i.panzoom.destroy(),i.panzoom=void 0,i.imageEl=void 0}onChange(t,e,i,n){for(const t of e.slides){const e=t.panzoom;e&&t.index!==i&&e.reset(.35)}}onClose(){const t=this.instance,e=t.container,i=t.getSlide();if(!e||!e.parentElement||!i)return;const{el:n,contentEl:s,panzoom:o}=i,a=i.thumbElSrc;if(!n||!a||!s||!o||o.isContentLoading||o.state===R.Init||o.state===R.Destroy)return;o.updateMetrics();let r=this.getZoomInfo(i);if(!r)return;this.instance.state=p.CustomClosing,n.classList.remove("is-zooming-in"),n.classList.add("is-zooming-out"),s.style.backgroundImage=`url('${a}')`,q(a).then((()=>{n.classList.add("hide-image")}),(()=>{}));const l=e.getBoundingClientRect();Object.assign(e.style,{position:"absolute",top:`${window.pageYOffset}px`,left:`${window.pageXOffset}px`,bottom:"auto",right:"auto",width:`${l.width}px`,height:`${l.height}px`,overflow:"hidden"});const{x:c,y:h,scale:d,opacity:u}=r;if(u){const t=((t,e,i,n)=>{const s=e-t,o=n-i;return e=>i+((e-t)/s*o||0)})(o.scale,d,1,0);o.on("afterTransform",(()=>{s.style.opacity=t(o.scale)+""}))}o.on("endAnimation",(()=>{t.destroy()})),o.target.a=d,o.target.b=0,o.target.c=0,o.target.d=d,o.panTo({x:c,y:h,scale:d,friction:u?.2:.33,ignoreBounds:!0}),o.isResting&&t.destroy()}setContent(t,e){return new Promise(((o,a)=>{var r,l;const c=this.instance,h=t.el;if(!h)return void a();c.showLoading(t);let d=this.optionFor(t,"content");if("string"==typeof d&&(d=n(d)),d&&s(d)||(d=document.createElement("img"),d instanceof HTMLImageElement&&(d.src=e||"",d.alt=(null===(r=t.caption)||void 0===r?void 0:r.replace(/<[^>]+>/gi,"").substring(0,1e3))||`Image ${t.index+1} of ${null===(l=c.carousel)||void 0===l?void 0:l.pages.length}`,d.draggable=!1,t.srcset&&d.setAttribute("srcset",t.srcset)),t.sizes&&d.setAttribute("sizes",t.sizes)),d.classList.add("fancybox-image"),t.imageEl=d,c.setContent(t,d,!1),this.option("protected")){h.addEventListener("contextmenu",(t=>{t.preventDefault()}));const e=t.contentEl;if(e){const t=document.createElement("div");F(t,"fancybox-protected"),e.append(t)}}t.panzoom=new Y(h,i({},this.option("Panzoom")||{},{content:d,width:c.optionFor(t,"width","auto"),height:c.optionFor(t,"height","auto"),wheel:()=>{const t=c.option("wheel");return("zoom"===t||"pan"==t)&&t},click:(e,i)=>{var n,s;if(c.isCompact||c.isClosing())return!1;if(t.index!==(null===(n=c.getSlide())||void 0===n?void 0:n.index))return!1;let o=!i||i.target&&(null===(s=t.contentEl)||void 0===s?void 0:s.contains(i.target));return c.option(o?"contentClick":"backdropClick")||!1},dblClick:()=>c.isCompact?"toggleZoom":c.option("contentDblClick")||!1,spinner:!1,panOnlyZoomed:!0,wheelLimit:1/0,transformParent:!0,on:{ready:t=>{o(t)},error:()=>{a()},destroy:()=>{a()}}}))}))}zoomIn(t){return new Promise(((e,i)=>{const{panzoom:n,contentEl:s,el:o}=t;n&&n.updateMetrics();const a=this.getZoomInfo(t);if(!(a&&o&&s&&n))return void i();const{x:r,y:l,scale:c,opacity:h}=a,d=()=>{t.state!==f.Closing&&(h&&(s.style.opacity=Math.max(Math.min(1,1-(1-n.scale)/(1-c)),0)+""),n.scale>=1&&n.scale>n.targetScale-.1&&e(n))},u=t=>{t.scale<.99||t.scale>1.01||(s.style.opacity="",o.classList.remove("is-zooming-in"),t.off("endAnimation",u),t.off("touchStart",u),t.off("afterTransform",d),e(t))};n.on("endAnimation",u),n.on("touchStart",u),n.on("afterTransform",d),n.on(["error","destroy"],(()=>{i()})),n.panTo({x:r,y:l,scale:c,friction:0,ignoreBounds:!0}),n.stop("current");const p=this.instance,m={event:"mousemove"===n.panMode?p.prevMouseMoveEvent||p.options.event:void 0},g=this.optionFor(t,"initialSize");F(o,"is-zooming-in"),p.hideLoading(t),"full"===g?n.zoomToFull(m):"cover"===g?n.zoomToCover(m):"max"===g?n.zoomToMax(m):n.reset(.165)}))}getZoomInfo(t){const{el:e,imageEl:i,thumbEl:n,panzoom:s}=t;if(!e||!i||!n||!s||o(n)<3||!this.optionFor(t,"zoom")||this.instance.state===p.Destroy)return!1;const{top:a,left:r,width:l,height:c}=n.getBoundingClientRect();let{top:h,left:d,fitWidth:u,fitHeight:f}=s.contentRect;if(!(l&&c&&u&&f))return!1;const m=l/u,g=s.container.getBoundingClientRect();h+=g.top,d+=g.left;const b=-1*(d+.5*u-(r+.5*l)),v=-1*(h+.5*f-(a+.5*c));let y=this.option("zoomOpacity")||!1;return"auto"===y&&(y=Math.abs(l/c-u/f)>.1),{x:b,y:v,scale:m,opacity:y}}attach(){this.instance.on("Carousel.change",this.onChange),this.instance.on("Carousel.createSlide",this.onCreateSlide),this.instance.on("Carousel.removeSlide",this.onRemoveSlide),this.instance.on("close",this.onClose)}detach(){this.instance.off("Carousel.change",this.onChange),this.instance.off("Carousel.createSlide",this.onCreateSlide),this.instance.off("Carousel.removeSlide",this.onRemoveSlide),this.instance.off("close",this.onClose)}}Object.defineProperty(Z,"defaults",{enumerable:!0,configurable:!0,writable:!0,value:{initialSize:"fit",Panzoom:{maxScale:1},protected:!1,zoom:!0,zoomOpacity:"auto"}});const V=(t,e={})=>{const i=new URL(t),n=new URLSearchParams(i.search),s=new URLSearchParams;for(const[t,i]of[...n,...Object.entries(e)]){let e=i.toString();"t"===t?s.set("start",parseInt(e).toString()):s.set(t,e)}let o=s.toString(),a=t.match(/#t=((.*)?\d+s)/);return a&&(o+=`#t=${a[1]}`),o},G={ajax:null,autoSize:!0,preload:!0,videoAutoplay:!0,videoRatio:16/9,videoTpl:'<video class="fancybox__html5video" playsinline controls controlsList="nodownload" poster="{{poster}}">\n  <source src="{{src}}" type="{{format}}" />Sorry, your browser doesn\'t support embedded videos.</video>',videoFormat:"",vimeo:{byline:1,color:"00adef",controls:1,dnt:1,muted:0},youtube:{controls:1,enablejsapi:1,nocookie:1,rel:0,fs:1}},U=["image","html","ajax","inline","clone","iframe","map","pdf","html5video","youtube","vimeo","video"];class K extends v{onInitSlide(t,e,i){this.processType(i)}onCreateSlide(t,e,i){this.setContent(i)}onRemoveSlide(t,e,i){i.closeBtnEl&&(i.closeBtnEl.remove(),i.closeBtnEl=void 0),i.xhr&&(i.xhr.abort(),i.xhr=null),i.iframeEl&&(i.iframeEl.onload=i.iframeEl.onerror=null,i.iframeEl.src="//about:blank",i.iframeEl=null);const n=i.contentEl,s=i.placeholderEl;if("inline"===i.type&&n&&s)n.classList.remove("fancybox__content"),"none"!==n.style.display&&(n.style.display="none"),s.parentNode&&s.parentNode.insertBefore(n,s),s.remove(),i.placeholderEl=null;else for(;i.el&&i.el.firstChild;)i.el.removeChild(i.el.firstChild)}onSelectSlide(t,e,i){i.state===f.Ready&&this.playVideo()}onUnselectSlide(t,e,i){var n,s;if("html5video"===i.type){try{null===(s=null===(n=i.el)||void 0===n?void 0:n.querySelector("video"))||void 0===s||s.pause()}catch(t){}return}let o;"vimeo"===i.type?o={method:"pause",value:"true"}:"youtube"===i.type&&(o={event:"command",func:"pauseVideo"}),o&&i.iframeEl&&i.iframeEl.contentWindow&&i.iframeEl.contentWindow.postMessage(JSON.stringify(o),"*"),i.poller&&clearTimeout(i.poller)}onDone(t,e){t.isCurrentSlide(e)&&!t.isClosing()&&this.playVideo()}onRefresh(t,e){e.slides.forEach((t=>{t.el&&(this.setAspectRatio(t),this.resizeIframe(t))}))}onMessage(t){try{let e=JSON.parse(t.data);if("https://player.vimeo.com"===t.origin){if("ready"===e.event)for(let e of Array.from(document.getElementsByClassName("fancybox__iframe")))e instanceof HTMLIFrameElement&&e.contentWindow===t.source&&(e.dataset.ready="true")}else if(t.origin.match(/^https:\/\/(www.)?youtube(-nocookie)?.com$/)&&"onReady"===e.event){const t=document.getElementById(e.id);t&&(t.dataset.ready="true")}}catch(t){}}loadAjaxContent(t){const e=this.instance.optionFor(t,"src")||"";this.instance.showLoading(t);const i=this.instance,n=new XMLHttpRequest;i.showLoading(t),n.onreadystatechange=function(){n.readyState===XMLHttpRequest.DONE&&i.state===p.Ready&&(i.hideLoading(t),200===n.status?i.setContent(t,n.responseText):i.setError(t,404===n.status?"{{AJAX_NOT_FOUND}}":"{{AJAX_FORBIDDEN}}"))};const s=t.ajax||null;n.open(s?"POST":"GET",e+""),n.setRequestHeader("Content-Type","application/x-www-form-urlencoded"),n.setRequestHeader("X-Requested-With","XMLHttpRequest"),n.send(s),t.xhr=n}setInlineContent(t){let e=null;if(s(t.src))e=t.src;else if("string"==typeof t.src){const i=t.src.split("#",2).pop();e=i?document.getElementById(i):null}if(e){if("clone"===t.type||e.closest(".fancybox__slide")){e=e.cloneNode(!0);const i=e.dataset.animationName;i&&(e.classList.remove(i),delete e.dataset.animationName);let n=e.getAttribute("id");n=n?`${n}--clone`:`clone-${this.instance.id}-${t.index}`,e.setAttribute("id",n)}else if(e.parentNode){const i=document.createElement("div");i.classList.add("fancybox-placeholder"),e.parentNode.insertBefore(i,e),t.placeholderEl=i}this.instance.setContent(t,e)}else this.instance.setError(t,"{{ELEMENT_NOT_FOUND}}")}setIframeContent(t){const{src:e,el:i}=t;if(!e||"string"!=typeof e||!i)return;const n=this.instance,s=document.createElement("iframe");s.className="fancybox__iframe",s.setAttribute("id",`fancybox__iframe_${n.id}_${t.index}`),s.setAttribute("allow","autoplay; fullscreen"),s.setAttribute("scrolling","auto"),s.onerror=()=>{n.setError(t,"{{IFRAME_ERROR}}")},t.iframeEl=s;const o=this.optionFor(t,"preload");if(i.classList.add("is-loading"),"iframe"!==t.type||!1===o)return s.setAttribute("src",t.src+""),this.resizeIframe(t),void n.setContent(t,s);n.showLoading(t),s.onload=()=>{if(!s.src.length)return;const e="true"!==s.dataset.ready;s.dataset.ready="true",this.resizeIframe(t),e?n.revealContent(t):n.hideLoading(t)},s.setAttribute("src",e),n.setContent(t,s,!1)}resizeIframe(t){const e=t.iframeEl,i=null==e?void 0:e.parentElement;if(!e||!i)return;let n=t.autoSize,s=t.width||0,o=t.height||0;s&&o&&(n=!1);const a=i&&i.style;if(!1!==t.preload&&!1!==n&&a)try{const t=window.getComputedStyle(i),n=parseFloat(t.paddingLeft)+parseFloat(t.paddingRight),r=parseFloat(t.paddingTop)+parseFloat(t.paddingBottom),l=e.contentWindow;if(l){const t=l.document,e=t.getElementsByTagName("html")[0],i=t.body;a.width="",i.style.overflow="hidden",s=s||e.scrollWidth+n,a.width=`${s}px`,i.style.overflow="",a.flex="0 0 auto",a.height=`${i.scrollHeight}px`,o=e.scrollHeight+r}}catch(t){}if(s||o){const t={flex:"0 1 auto",width:"",height:""};s&&(t.width=`${s}px`),o&&(t.height=`${o}px`),Object.assign(a,t)}}playVideo(){const t=this.instance.getSlide();if(!t)return;const{el:e}=t;if(!e||!e.offsetParent)return;if(!this.optionFor(t,"videoAutoplay"))return;if("html5video"===t.type)try{const t=e.querySelector("video");if(t){const e=t.play();void 0!==e&&e.then((()=>{})).catch((e=>{t.muted=!0,t.play()}))}}catch(t){}if("youtube"!==t.type&&"vimeo"!==t.type)return;const i=()=>{if(t.iframeEl&&t.iframeEl.contentWindow){let e;if("true"===t.iframeEl.dataset.ready)return e="youtube"===t.type?{event:"command",func:"playVideo"}:{method:"play",value:"true"},e&&t.iframeEl.contentWindow.postMessage(JSON.stringify(e),"*"),void(t.poller=void 0);"youtube"===t.type&&(e={event:"listening",id:t.iframeEl.getAttribute("id")},t.iframeEl.contentWindow.postMessage(JSON.stringify(e),"*"))}t.poller=setTimeout(i,250)};i()}processType(t){if(t.html)return t.type="html",t.src=t.html,void(t.html="");const e=this.instance.optionFor(t,"src","");if(!e||"string"!=typeof e)return;let i=t.type,n=null;if(n=e.match(/(youtube\.com|youtu\.be|youtube\-nocookie\.com)\/(?:watch\?(?:.*&)?v=|v\/|u\/|embed\/?)?(videoseries\?list=(?:.*)|[\w-]{11}|\?listType=(?:.*)&list=(?:.*))(?:.*)/i)){const s=this.optionFor(t,"youtube"),{nocookie:o}=s,a=function(t,e){var i={};for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&e.indexOf(n)<0&&(i[n]=t[n]);if(null!=t&&"function"==typeof Object.getOwnPropertySymbols){var s=0;for(n=Object.getOwnPropertySymbols(t);s<n.length;s++)e.indexOf(n[s])<0&&Object.prototype.propertyIsEnumerable.call(t,n[s])&&(i[n[s]]=t[n[s]])}return i}(s,["nocookie"]),r=`www.youtube${o?"-nocookie":""}.com`,l=V(e,a),c=encodeURIComponent(n[2]);t.videoId=c,t.src=`https://${r}/embed/${c}?${l}`,t.thumbSrc=t.thumbSrc||`https://i.ytimg.com/vi/${c}/mqdefault.jpg`,i="youtube"}else if(n=e.match(/^.+vimeo.com\/(?:\/)?([\d]+)((\/|\?h=)([a-z0-9]+))?(.*)?/)){const s=V(e,this.optionFor(t,"vimeo")),o=encodeURIComponent(n[1]),a=n[4]||"";t.videoId=o,t.src=`https://player.vimeo.com/video/${o}?${a?`h=${a}${s?"&":""}`:""}${s}`,i="vimeo"}if(!i&&t.triggerEl){const e=t.triggerEl.dataset.type;U.includes(e)&&(i=e)}i||"string"==typeof e&&("#"===e.charAt(0)?i="inline":(n=e.match(/\.(mp4|mov|ogv|webm)((\?|#).*)?$/i))?(i="html5video",t.videoFormat=t.videoFormat||"video/"+("ogv"===n[1]?"ogg":n[1])):e.match(/(^data:image\/[a-z0-9+\/=]*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp|svg|ico)((\?|#).*)?$)/i)?i="image":e.match(/\.(pdf)((\?|#).*)?$/i)?i="pdf":(n=e.match(/(?:maps\.)?google\.([a-z]{2,3}(?:\.[a-z]{2})?)\/(?:(?:(?:maps\/(?:place\/(?:.*)\/)?\@(.*),(\d+.?\d+?)z))|(?:\?ll=))(.*)?/i))?(t.src=`https://maps.google.${n[1]}/?ll=${(n[2]?n[2]+"&z="+Math.floor(parseFloat(n[3]))+(n[4]?n[4].replace(/^\//,"&"):""):n[4]+"").replace(/\?/,"&")}&output=${n[4]&&n[4].indexOf("layer=c")>0?"svembed":"embed"}`,i="map"):(n=e.match(/(?:maps\.)?google\.([a-z]{2,3}(?:\.[a-z]{2})?)\/(?:maps\/search\/)(.*)/i))&&(t.src=`https://maps.google.${n[1]}/maps?q=${n[2].replace("query=","q=").replace("api=1","")}&output=embed`,i="map")),i=i||this.instance.option("defaultType"),t.type=i,"image"===i&&(t.thumbSrc=t.thumbSrc||t.src)}setContent(t){const e=this.instance.optionFor(t,"src")||"";if(t&&t.type&&e){switch(t.type){case"html":this.instance.setContent(t,e);break;case"html5video":const i=this.option("videoTpl");i&&this.instance.setContent(t,i.replace(/\{\{src\}\}/gi,e+"").replace(/\{\{format\}\}/gi,this.optionFor(t,"videoFormat")||"").replace(/\{\{poster\}\}/gi,t.poster||t.thumbSrc||""));break;case"inline":case"clone":this.setInlineContent(t);break;case"ajax":this.loadAjaxContent(t);break;case"pdf":case"map":case"youtube":case"vimeo":t.preload=!1;case"iframe":this.setIframeContent(t)}this.setAspectRatio(t)}}setAspectRatio(t){var e;const i=t.contentEl,n=this.optionFor(t,"videoRatio"),s=null===(e=t.el)||void 0===e?void 0:e.getBoundingClientRect();if(!(i&&s&&n&&1!==n&&t.type&&["video","youtube","vimeo","html5video"].includes(t.type)))return;const o=s.width,a=s.height;i.style.aspectRatio=n+"",i.style.width=o/a>n?"auto":"",i.style.height=o/a>n?"":"auto"}attach(){this.instance.on("Carousel.initSlide",this.onInitSlide),this.instance.on("Carousel.createSlide",this.onCreateSlide),this.instance.on("Carousel.removeSlide",this.onRemoveSlide),this.instance.on("Carousel.selectSlide",this.onSelectSlide),this.instance.on("Carousel.unselectSlide",this.onUnselectSlide),this.instance.on("Carousel.Panzoom.refresh",this.onRefresh),this.instance.on("done",this.onDone),window.addEventListener("message",this.onMessage)}detach(){this.instance.off("Carousel.initSlide",this.onInitSlide),this.instance.off("Carousel.createSlide",this.onCreateSlide),this.instance.off("Carousel.removeSlide",this.onRemoveSlide),this.instance.off("Carousel.selectSlide",this.onSelectSlide),this.instance.off("Carousel.unselectSlide",this.onUnselectSlide),this.instance.off("Carousel.Panzoom.refresh",this.onRefresh),this.instance.off("done",this.onDone),window.removeEventListener("message",this.onMessage)}}Object.defineProperty(K,"defaults",{enumerable:!0,configurable:!0,writable:!0,value:G});class J extends v{constructor(){super(...arguments),Object.defineProperty(this,"state",{enumerable:!0,configurable:!0,writable:!0,value:"ready"}),Object.defineProperty(this,"inHover",{enumerable:!0,configurable:!0,writable:!0,value:!1}),Object.defineProperty(this,"timer",{enumerable:!0,configurable:!0,writable:!0,value:null}),Object.defineProperty(this,"progressBar",{enumerable:!0,configurable:!0,writable:!0,value:null})}get isActive(){return"ready"!==this.state}onReady(t){this.option("autoStart")&&(t.isInfinite||t.page<t.pages.length-1)&&this.start()}onChange(){var t;(null===(t=this.instance.panzoom)||void 0===t?void 0:t.isResting)||(this.removeProgressBar(),this.pause())}onSettle(){this.resume()}onVisibilityChange(){"visible"===document.visibilityState?this.resume():this.pause()}onMouseEnter(){this.inHover=!0,this.pause()}onMouseLeave(){var t;this.inHover=!1,(null===(t=this.instance.panzoom)||void 0===t?void 0:t.isResting)&&this.resume()}onTimerEnd(){"play"===this.state&&(this.instance.isInfinite||this.instance.page!==this.instance.pages.length-1?this.instance.slideNext():this.instance.slideTo(0))}removeProgressBar(){this.progressBar&&(this.progressBar.remove(),this.progressBar=null)}createProgressBar(){var t;if(!this.option("showProgress"))return null;this.removeProgressBar();const e=this.instance,i=(null===(t=e.pages[e.page])||void 0===t?void 0:t.slides)||[];let n=this.option("progressParentEl");if(n||(n=(1===i.length?i[0].el:null)||e.viewport),!n)return null;const s=document.createElement("div");return F(s,"f-progress"),n.prepend(s),this.progressBar=s,s.offsetHeight,s}set(){if(this.instance.pages.length<2)return;if(this.progressBar)return;const t=this.option("timeout");this.state="play",F(this.instance.container,"has-autoplay");let e=this.createProgressBar();e&&(e.style.transitionDuration=`${t}ms`,e.style.transform="scaleX(1)"),this.timer=setTimeout((()=>{this.timer=null,this.inHover||this.onTimerEnd()}),t),this.emit("set")}clear(){this.timer&&(clearTimeout(this.timer),this.timer=null),this.removeProgressBar()}start(){if(this.set(),this.option("pauseOnHover")){const t=this.instance.container;t.addEventListener("mouseenter",this.onMouseEnter,!1),t.addEventListener("mouseleave",this.onMouseLeave,!1)}document.addEventListener("visibilitychange",this.onVisibilityChange,!1)}stop(){const t=this.instance.container;this.clear(),this.state="ready",t.removeEventListener("mouseenter",this.onMouseEnter,!1),t.removeEventListener("mouseleave",this.onMouseLeave,!1),document.removeEventListener("visibilitychange",this.onVisibilityChange,!1),D(t,"has-autoplay"),this.emit("stop")}pause(){"play"===this.state&&(this.state="pause",this.clear(),this.emit("pause"))}resume(){const t=this.instance;if(t.isInfinite||t.page!==t.pages.length-1)if("play"!==this.state){if("pause"===this.state&&!this.inHover){const t=new Event("resume",{bubbles:!0,cancelable:!0});this.emit("resume",event),t.defaultPrevented||this.set()}}else this.set();else this.stop()}toggle(){"play"===this.state||"pause"===this.state?this.stop():this.set()}attach(){this.instance.on("ready",this.onReady),this.instance.on("Panzoom.startAnimation",this.onChange),this.instance.on("Panzoom.endAnimation",this.onSettle),this.instance.on("Panzoom.touchMove",this.onChange)}detach(){this.instance.off("ready",this.onReady),this.instance.off("Panzoom.startAnimation",this.onChange),this.instance.off("Panzoom.endAnimation",this.onSettle),this.instance.off("Panzoom.touchMove",this.onChange),this.stop()}}Object.defineProperty(J,"defaults",{enumerable:!0,configurable:!0,writable:!0,value:{autoStart:!0,pauseOnHover:!0,progressParentEl:null,showProgress:!0,timeout:3e3}});class Q extends v{constructor(){super(...arguments),Object.defineProperty(this,"ref",{enumerable:!0,configurable:!0,writable:!0,value:null})}onPrepare(t){const e=t.carousel;if(!e)return;const n=t.container;n&&(e.options.Autoplay=i(this.option("Autoplay")||{},{pauseOnHover:!1,autoStart:!1,timeout:this.option("timeout"),progressParentEl:()=>n.querySelector(".fancybox__toolbar [data-fancybox-toggle-slideshow]")||n,on:{set:e=>{var i;n.classList.add("has-slideshow"),(null===(i=t.getSlide())||void 0===i?void 0:i.state)!==f.Ready&&e.pause()},stop:()=>{n.classList.remove("has-slideshow"),t.isCompact||t.endIdle()},resume:(e,i)=>{var n,s,o;!i||!i.cancelable||(null===(n=t.getSlide())||void 0===n?void 0:n.state)===f.Ready&&(null===(o=null===(s=t.carousel)||void 0===s?void 0:s.panzoom)||void 0===o?void 0:o.isResting)||i.preventDefault()}}}),e.attachPlugins({Autoplay:J}),this.ref=e.plugins.Autoplay)}onReady(t){const e=t.carousel,i=this.ref;e&&i&&this.option("playOnStart")&&(e.isInfinite||e.page<e.pages.length-1)&&i.start()}onDone(t,e){const i=this.ref;if(!i)return;const n=e.panzoom;n&&n.on("startAnimation",(()=>{t.isCurrentSlide(e)&&i.stop()})),t.isCurrentSlide(e)&&i.resume()}onKeydown(t,e){var i;const n=this.ref;n&&e===this.option("key")&&"BUTTON"!==(null===(i=document.activeElement)||void 0===i?void 0:i.nodeName)&&n.toggle()}attach(){this.instance.on("Carousel.init",this.onPrepare),this.instance.on("Carousel.ready",this.onReady),this.instance.on("done",this.onDone),this.instance.on("keydown",this.onKeydown)}detach(){this.instance.off("Carousel.init",this.onPrepare),this.instance.off("Carousel.ready",this.onReady),this.instance.off("done",this.onDone),this.instance.off("keydown",this.onKeydown)}}Object.defineProperty(Q,"defaults",{enumerable:!0,configurable:!0,writable:!0,value:{key:" ",playOnStart:!1,timeout:3e3}});const tt={classes:{container:"f-thumbs f-carousel__thumbs",viewport:"f-thumbs__viewport",track:"f-thumbs__track",slide:"f-thumbs__slide",isResting:"is-resting",isSelected:"is-selected",isLoading:"is-loading",hasThumbs:"has-thumbs"},minCount:2,parentEl:null,thumbTpl:'<button class="f-thumbs__slide__button" tabindex="0" type="button" aria-label="{{GOTO}}" data-carousel-index="%i"><img class="f-thumbs__slide__img" data-lazy-src="{{%s}}" alt="" /></button>',type:"modern"};var et;!function(t){t[t.Init=0]="Init",t[t.Ready=1]="Ready",t[t.Hidden=2]="Hidden",t[t.Disabled=3]="Disabled"}(et||(et={}));let it=class extends v{constructor(){super(...arguments),Object.defineProperty(this,"type",{enumerable:!0,configurable:!0,writable:!0,value:"modern"}),Object.defineProperty(this,"container",{enumerable:!0,configurable:!0,writable:!0,value:null}),Object.defineProperty(this,"track",{enumerable:!0,configurable:!0,writable:!0,value:null}),Object.defineProperty(this,"carousel",{enumerable:!0,configurable:!0,writable:!0,value:null}),Object.defineProperty(this,"panzoom",{enumerable:!0,configurable:!0,writable:!0,value:null}),Object.defineProperty(this,"thumbWidth",{enumerable:!0,configurable:!0,writable:!0,value:0}),Object.defineProperty(this,"thumbClipWidth",{enumerable:!0,configurable:!0,writable:!0,value:0}),Object.defineProperty(this,"thumbHeight",{enumerable:!0,configurable:!0,writable:!0,value:0}),Object.defineProperty(this,"thumbGap",{enumerable:!0,configurable:!0,writable:!0,value:0}),Object.defineProperty(this,"thumbExtraGap",{enumerable:!0,configurable:!0,writable:!0,value:0}),Object.defineProperty(this,"shouldCenter",{enumerable:!0,configurable:!0,writable:!0,value:!0}),Object.defineProperty(this,"state",{enumerable:!0,configurable:!0,writable:!0,value:et.Init})}formatThumb(t,e){return this.instance.localize(e,[["%i",t.index],["%d",t.index+1],["%s",t.thumbSrc||"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"]])}getSlides(){const t=[],e=this.option("thumbTpl")||"";if(e)for(const i of this.instance.slides||[]){let n="";i.type&&(n=`for-${i.type}`,i.type&&["video","youtube","vimeo","html5video"].includes(i.type)&&(n+=" for-video")),t.push({html:this.formatThumb(i,e),customClass:n})}return t}onInitSlide(t,e){const i=e.el;i&&(e.thumbSrc=i.dataset.thumbSrc||e.thumbSrc||"",e.thumbClipWidth=parseFloat(i.dataset.thumbClipWidth||"")||e.thumbClipWidth||0,e.thumbHeight=parseFloat(i.dataset.thumbHeight||"")||e.thumbHeight||0)}onInitSlides(){this.state===et.Init&&this.build()}onRefreshM(){this.refreshModern()}onChangeM(){"modern"===this.type&&(this.shouldCenter=!0,this.centerModern())}onClickModern(t){t.preventDefault(),t.stopPropagation();const e=this.instance,i=e.page,n=t=>{if(t){const e=t.closest("[data-carousel-index]");if(e)return parseInt(e.dataset.carouselIndex||"",10)||0}return-1},s=(t,e)=>{const i=document.elementFromPoint(t,e);return i?n(i):-1};let o=n(t.target);o<0&&(o=s(t.clientX+this.thumbGap,t.clientY),o===i&&(o=i-1)),o<0&&(o=s(t.clientX-this.thumbGap,t.clientY),o===i&&(o=i+1)),o<0&&(o=(e=>{let n=s(t.clientX-e,t.clientY),a=s(t.clientX+e,t.clientY);return o<0&&n===i&&(o=i+1),o<0&&a===i&&(o=i-1),o})(this.thumbExtraGap)),o===i?this.centerModern():o>-1&&o<e.pages.length&&e.slideTo(o)}onTransformM(){if("modern"!==this.type)return;const{instance:t,container:e,track:i}=this,n=t.panzoom;if(!(e&&i&&n&&this.panzoom))return;M(e,this.cn("isResting"),n.state!==R.Init&&n.isResting);const s=this.thumbGap,o=this.thumbExtraGap,a=this.thumbClipWidth;let r=0,l=0,c=0;for(const e of t.slides){let i=e.index,n=e.thumbSlideEl;if(!n)continue;M(n,this.cn("isSelected"),i===t.page),l=1-Math.abs(t.getProgress(i)),n.style.setProperty("--progress",l?l+"":"");const h=.5*((e.thumbWidth||0)-a);r+=s,r+=h,l&&(r-=l*(h+o)),n.style.setProperty("--shift",r-s+""),r+=h,l&&(r-=l*(h+o)),r-=s,0===i&&(c=o*l)}i&&(i.style.setProperty("--left",c+""),i.style.setProperty("--width",r+c+s+o*l+"")),this.shouldCenter&&this.centerModern()}buildClassic(){const{container:t,track:e}=this,n=this.getSlides();if(!t||!e||!n)return;const s=new this.instance.constructor(t,i({track:e,infinite:!1,center:!0,fill:!0,dragFree:!0,slidesPerPage:1,transition:!1,Dots:!1,Navigation:!1,Sync:{},classes:{container:"f-thumbs",viewport:"f-thumbs__viewport",track:"f-thumbs__track",slide:"f-thumbs__slide"}},this.option("Carousel")||{},{Sync:{target:this.instance},slides:n}));this.carousel=s,this.track=e,s.on("ready",(()=>{this.emit("ready")}))}buildModern(){if("modern"!==this.type)return;const{container:t,track:e,instance:i}=this,s=this.option("thumbTpl")||"";if(!t||!e||!s)return;F(t,"is-horizontal"),this.updateModern();for(const t of i.slides||[]){const i=document.createElement("div");if(F(i,this.cn("slide")),t.type){let e=`for-${t.type}`;["video","youtube","vimeo","html5video"].includes(t.type)&&(e+=" for-video"),F(i,e)}i.appendChild(n(this.formatThumb(t,s))),t.thumbSlideEl=i,e.appendChild(i),this.resizeModernSlide(t)}const o=new i.constructor.Panzoom(t,{content:e,lockAxis:"x",zoom:!1,panOnlyZoomed:!1,bounds:()=>{let t=0,e=0,n=i.slides[0],s=i.slides[i.slides.length-1],o=i.slides[i.page];return n&&s&&o&&(e=-1*this.getModernThumbPos(0),0!==i.page&&(e+=.5*(n.thumbWidth||0)),t=-1*this.getModernThumbPos(i.slides.length-1),i.page!==i.slides.length-1&&(t+=(s.thumbWidth||0)-(o.thumbWidth||0)-.5*(s.thumbWidth||0))),{x:{min:t,max:e},y:{min:0,max:0}}}});o.on("touchStart",((t,e)=>{this.shouldCenter=!1})),o.on("click",((t,e)=>this.onClickModern(e))),o.on("ready",(()=>{this.centerModern(),this.emit("ready")})),o.on(["afterTransform","refresh"],(t=>{this.lazyLoadModern()})),this.panzoom=o,this.refreshModern()}updateModern(){if("modern"!==this.type)return;const{container:t}=this;t&&(this.thumbGap=parseFloat(getComputedStyle(t).getPropertyValue("--f-thumb-gap"))||0,this.thumbExtraGap=parseFloat(getComputedStyle(t).getPropertyValue("--f-thumb-extra-gap"))||0,this.thumbWidth=parseFloat(getComputedStyle(t).getPropertyValue("--f-thumb-width"))||40,this.thumbClipWidth=parseFloat(getComputedStyle(t).getPropertyValue("--f-thumb-clip-width"))||40,this.thumbHeight=parseFloat(getComputedStyle(t).getPropertyValue("--f-thumb-height"))||40)}refreshModern(){var t;if("modern"===this.type){this.updateModern();for(const t of this.instance.slides||[])this.resizeModernSlide(t);this.onTransformM(),null===(t=this.panzoom)||void 0===t||t.updateMetrics(!0),this.centerModern(0)}}centerModern(t){const e=this.instance,{container:i,panzoom:n}=this;if(!i||!n||n.state===R.Init)return;const s=e.page;let o=this.getModernThumbPos(s),a=o;for(let t=e.page-3;t<e.page+3;t++){if(t<0||t>e.pages.length-1||t===e.page)continue;const i=1-Math.abs(e.getProgress(t));i>0&&i<1&&(a+=i*(this.getModernThumbPos(t)-o))}let r=100;void 0===t&&(t=.2,e.inTransition.size>0&&(t=.12),Math.abs(-1*n.current.e-a)>n.containerRect.width&&(t=.5,r=0)),n.options.maxVelocity=r,n.applyChange({panX:E(-1*a-n.target.e,1e3),friction:null===e.prevPage?0:t})}lazyLoadModern(){const{instance:t,panzoom:e}=this;if(!e)return;const i=-1*e.current.e||0;let s=this.getModernThumbPos(t.page);if(e.state!==R.Init||0===s)for(const s of t.slides||[]){const t=s.thumbSlideEl;if(!t)continue;const o=t.querySelector("img[data-lazy-src]"),a=s.index,r=this.getModernThumbPos(a),l=i-.5*e.containerRect.innerWidth,c=l+e.containerRect.innerWidth;if(!o||r<l||r>c)continue;let d=o.dataset.lazySrc;if(!d||!d.length)continue;if(delete o.dataset.lazySrc,o.src=d,o.complete)continue;F(t,this.cn("isLoading"));const u=n(h);t.appendChild(u),o.addEventListener("load",(()=>{t.offsetParent&&(t.classList.remove(this.cn("isLoading")),u.remove())}),!1)}}resizeModernSlide(t){if("modern"!==this.type)return;if(!t.thumbSlideEl)return;const e=t.thumbClipWidth&&t.thumbHeight?Math.round(this.thumbHeight*(t.thumbClipWidth/t.thumbHeight)):this.thumbWidth;t.thumbWidth=e}getModernThumbPos(t){const e=this.instance.slides[t],i=this.panzoom;if(!i||!i.contentRect.fitWidth)return 0;let n=i.containerRect.innerWidth,s=i.contentRect.width;2===this.instance.slides.length&&(t-=1,s=2*this.thumbClipWidth);let o=t*(this.thumbClipWidth+this.thumbGap)+this.thumbExtraGap+.5*(e.thumbWidth||0);return o-=s>n?.5*n:.5*s,E(o||0,1)}build(){const t=this.instance,e=t.container,i=this.option("minCount")||0;if(i){let e=0;for(const i of t.slides||[])i.thumbSrc&&e++;if(e<i)return this.cleanup(),void(this.state=et.Disabled)}const n=this.option("type");if(["modern","classic"].indexOf(n)<0)return void(this.state=et.Disabled);this.type=n;const s=document.createElement("div");F(s,this.cn("container")),F(s,`is-${n}`);const o=this.option("parentEl");o?o.appendChild(s):e.after(s),this.container=s,F(e,this.cn("hasThumbs"));const a=document.createElement("div");F(a,this.cn("track")),s.appendChild(a),this.track=a,"classic"===n?this.buildClassic():this.buildModern(),this.state=et.Ready,s.addEventListener("click",(e=>{setTimeout((()=>{var e;null===(e=null==s?void 0:s.querySelector(`[data-carousel-index="${t.page}"]`))||void 0===e||e.focus()}),100)}))}cleanup(){this.carousel&&this.carousel.destroy(),this.carousel=null,this.panzoom&&this.panzoom.destroy(),this.panzoom=null,this.container&&this.container.remove(),this.container=null,this.track=null,this.state=et.Init,D(this.instance.container,this.cn("hasThumbs"))}attach(){this.instance.on("initSlide",this.onInitSlide),this.instance.on("initSlides",this.onInitSlides),this.instance.on("Panzoom.afterTransform",this.onTransformM),this.instance.on("Panzoom.refresh",this.onRefreshM),this.instance.on("change",this.onChangeM)}detach(){this.instance.off("initSlide",this.onInitSlide),this.instance.off("initSlides",this.onInitSlides),this.instance.off("Panzoom.afterTransform",this.onTransformM),this.instance.off("Panzoom.refresh",this.onRefreshM),this.instance.off("change",this.onChangeM),this.cleanup()}};Object.defineProperty(it,"defaults",{enumerable:!0,configurable:!0,writable:!0,value:tt});const nt=Object.assign(Object.assign({},tt),{key:"t",showOnStart:!0,parentEl:null});class st extends v{constructor(){super(...arguments),Object.defineProperty(this,"ref",{enumerable:!0,configurable:!0,writable:!0,value:null}),Object.defineProperty(this,"hidden",{enumerable:!0,configurable:!0,writable:!0,value:!1})}get isEnabled(){const t=this.ref;return t&&t.state!==et.Disabled}get isHidden(){return this.hidden}onInit(){const t=this.instance,e=t.carousel;if(!e)return;const n=this.option("parentEl")||t.footer||t.container;n&&(e.options.Thumbs=i({},this.options,{parentEl:n,classes:{container:"f-thumbs fancybox__thumbs"},Carousel:{Sync:{friction:t.option("Carousel.friction")},on:{click:(t,e)=>{e.stopPropagation()}}},on:{ready:t=>{const e=t.container;e&&this.hidden&&(this.refresh(),e.style.transition="none",this.hide(),e.offsetHeight,queueMicrotask((()=>{e.style.transition="",this.show()})))}}}),e.attachPlugins({Thumbs:it}),this.ref=e.plugins.Thumbs,this.option("showOnStart")||(this.ref.state=et.Hidden,this.hidden=!0))}onResize(){var t;const e=null===(t=this.ref)||void 0===t?void 0:t.container;e&&(e.style.maxHeight="")}onKeydown(t,e){const i=this.option("key");i&&i===e&&this.toggle()}toggle(){const t=this.ref;t&&t.state!==et.Disabled&&(t.state!==et.Hidden?this.hidden?this.show():this.hide():t.build())}show(){const t=this.ref,e=t&&t.state!==et.Disabled&&t.container;e&&(this.refresh(),e.offsetHeight,e.removeAttribute("aria-hidden"),e.classList.remove("is-hidden"),this.hidden=!1)}hide(){const t=this.ref,e=t&&t.container;e&&(this.refresh(),e.offsetHeight,e.classList.add("is-hidden"),e.setAttribute("aria-hidden","true")),this.hidden=!0}refresh(){const t=this.ref;if(!t||t.state===et.Disabled)return;const e=t.container,i=(null==e?void 0:e.firstChild)||null;e&&i&&i.childNodes.length&&(e.style.maxHeight=`${i.getBoundingClientRect().height}px`)}attach(){this.instance.on("Carousel.init",this.onInit),this.instance.on("resize",this.onResize),this.instance.on("keydown",this.onKeydown)}detach(){this.instance.off("Carousel.init",this.onInit),this.instance.off("resize",this.onResize),this.instance.off("keydown",this.onKeydown)}}Object.defineProperty(st,"defaults",{enumerable:!0,configurable:!0,writable:!0,value:nt});const ot={panLeft:{icon:'<svg><path d="M5 12h14M5 12l6 6M5 12l6-6"/></svg>',change:{panX:-100}},panRight:{icon:'<svg><path d="M5 12h14M13 18l6-6M13 6l6 6"/></svg>',change:{panX:100}},panUp:{icon:'<svg><path d="M12 5v14M18 11l-6-6M6 11l6-6"/></svg>',change:{panY:-100}},panDown:{icon:'<svg><path d="M12 5v14M18 13l-6 6M6 13l6 6"/></svg>',change:{panY:100}},zoomIn:{icon:'<svg><circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.35-4.35M11 8v6M8 11h6"/></svg>',action:"zoomIn"},zoomOut:{icon:'<svg><circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.35-4.35M8 11h6"/></svg>',action:"zoomOut"},toggle1to1:{icon:'<svg><path d="M3.51 3.07c5.74.02 11.48-.02 17.22.02 1.37.1 2.34 1.64 2.18 3.13 0 4.08.02 8.16 0 12.23-.1 1.54-1.47 2.64-2.79 2.46-5.61-.01-11.24.02-16.86-.01-1.36-.12-2.33-1.65-2.17-3.14 0-4.07-.02-8.16 0-12.23.1-1.36 1.22-2.48 2.42-2.46Z"/><path d="M5.65 8.54h1.49v6.92m8.94-6.92h1.49v6.92M11.5 9.4v.02m0 5.18v0"/></svg>',action:"toggleZoom"},toggleZoom:{icon:'<svg><g><line x1="11" y1="8" x2="11" y2="14"></line></g><circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.35-4.35M8 11h6"/></svg>',action:"toggleZoom"},iterateZoom:{icon:'<svg><g><line x1="11" y1="8" x2="11" y2="14"></line></g><circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.35-4.35M8 11h6"/></svg>',action:"iterateZoom"},rotateCCW:{icon:'<svg><path d="M15 4.55a8 8 0 0 0-6 14.9M9 15v5H4M18.37 7.16v.01M13 19.94v.01M16.84 18.37v.01M19.37 15.1v.01M19.94 11v.01"/></svg>',action:"rotateCCW"},rotateCW:{icon:'<svg><path d="M9 4.55a8 8 0 0 1 6 14.9M15 15v5h5M5.63 7.16v.01M4.06 11v.01M4.63 15.1v.01M7.16 18.37v.01M11 19.94v.01"/></svg>',action:"rotateCW"},flipX:{icon:'<svg style="stroke-width: 1.3"><path d="M12 3v18M16 7v10h5L16 7M8 7v10H3L8 7"/></svg>',action:"flipX"},flipY:{icon:'<svg style="stroke-width: 1.3"><path d="M3 12h18M7 16h10L7 21v-5M7 8h10L7 3v5"/></svg>',action:"flipY"},fitX:{icon:'<svg><path d="M4 12V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6M10 18H3M21 18h-7M6 15l-3 3 3 3M18 15l3 3-3 3"/></svg>',action:"fitX"},fitY:{icon:'<svg><path d="M12 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6M18 14v7M18 3v7M15 18l3 3 3-3M15 6l3-3 3 3"/></svg>',action:"fitY"},reset:{icon:'<svg><path d="M20 11A8.1 8.1 0 0 0 4.5 9M4 5v4h4M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"/></svg>',action:"reset"},toggleFS:{icon:'<svg><g><path d="M14.5 9.5 21 3m0 0h-6m6 0v6M3 21l6.5-6.5M3 21v-6m0 6h6"/></g><g><path d="m14 10 7-7m-7 7h6m-6 0V4M3 21l7-7m0 0v6m0-6H4"/></g></svg>',action:"toggleFS"}};var at;!function(t){t[t.Init=0]="Init",t[t.Ready=1]="Ready",t[t.Disabled=2]="Disabled"}(at||(at={}));const rt={absolute:"auto",display:{left:["infobar"],middle:[],right:["iterateZoom","slideshow","fullscreen","thumbs","close"]},enabled:"auto",items:{infobar:{tpl:'<div class="fancybox__infobar" tabindex="-1"><span data-fancybox-current-index></span>/<span data-fancybox-count></span></div>'},download:{tpl:'<a class="f-button" title="{{DOWNLOAD}}" data-fancybox-download href="javasript:;"><svg><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 11l5 5 5-5M12 4v12"/></svg></a>'},prev:{tpl:'<button class="f-button" title="{{PREV}}" data-fancybox-prev><svg><path d="m15 6-6 6 6 6"/></svg></button>'},next:{tpl:'<button class="f-button" title="{{NEXT}}" data-fancybox-next><svg><path d="m9 6 6 6-6 6"/></svg></button>'},slideshow:{tpl:'<button class="f-button" title="{{TOGGLE_SLIDESHOW}}" data-fancybox-toggle-slideshow><svg><g><path d="M8 4v16l13 -8z"></path></g><g><path d="M8 4v15M17 4v15"/></g></svg></button>'},fullscreen:{tpl:'<button class="f-button" title="{{TOGGLE_FULLSCREEN}}" data-fancybox-toggle-fullscreen><svg><g><path d="M4 8V6a2 2 0 0 1 2-2h2M4 16v2a2 2 0 0 0 2 2h2M16 4h2a2 2 0 0 1 2 2v2M16 20h2a2 2 0 0 0 2-2v-2"/></g><g><path d="M15 19v-2a2 2 0 0 1 2-2h2M15 5v2a2 2 0 0 0 2 2h2M5 15h2a2 2 0 0 1 2 2v2M5 9h2a2 2 0 0 0 2-2V5"/></g></svg></button>'},thumbs:{tpl:'<button class="f-button" title="{{TOGGLE_THUMBS}}" data-fancybox-toggle-thumbs><svg><circle cx="5.5" cy="5.5" r="1"/><circle cx="12" cy="5.5" r="1"/><circle cx="18.5" cy="5.5" r="1"/><circle cx="5.5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="18.5" cy="12" r="1"/><circle cx="5.5" cy="18.5" r="1"/><circle cx="12" cy="18.5" r="1"/><circle cx="18.5" cy="18.5" r="1"/></svg></button>'},close:{tpl:'<button class="f-button" title="{{CLOSE}}" data-fancybox-close><svg><path d="m19.5 4.5-15 15M4.5 4.5l15 15"/></svg></button>'}},parentEl:null},lt={tabindex:"-1",width:"24",height:"24",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"};class ct extends v{constructor(){super(...arguments),Object.defineProperty(this,"state",{enumerable:!0,configurable:!0,writable:!0,value:at.Init}),Object.defineProperty(this,"container",{enumerable:!0,configurable:!0,writable:!0,value:null})}onReady(t){var e;if(!t.carousel)return;let i=this.option("display"),n=this.option("absolute"),s=this.option("enabled");if("auto"===s){const t=this.instance.carousel;let e=0;if(t)for(const i of t.slides)(i.panzoom||"image"===i.type)&&e++;e||(s=!1)}s||(i=void 0);let o=0;const a={left:[],middle:[],right:[]};if(i)for(const t of["left","middle","right"])for(const n of i[t]){const i=this.createEl(n);i&&(null===(e=a[t])||void 0===e||e.push(i),o++)}let r=null;if(o&&(r=this.createContainer()),r){for(const[t,e]of Object.entries(a)){const i=document.createElement("div");F(i,"fancybox__toolbar__column is-"+t);for(const t of e)i.appendChild(t);"auto"!==n||"middle"!==t||e.length||(n=!0),r.appendChild(i)}!0===n&&F(r,"is-absolute"),this.state=at.Ready,this.onRefresh()}else this.state=at.Disabled}onClick(t){var e,i;const n=this.instance,o=n.getSlide(),a=null==o?void 0:o.panzoom,r=t.target,l=r&&s(r)?r.dataset:null;if(!l)return;if(void 0!==l.fancyboxToggleThumbs)return t.preventDefault(),t.stopPropagation(),void(null===(e=n.plugins.Thumbs)||void 0===e||e.toggle());if(void 0!==l.fancyboxToggleFullscreen)return t.preventDefault(),t.stopPropagation(),void this.instance.toggleFullscreen();if(void 0!==l.fancyboxToggleSlideshow){t.preventDefault(),t.stopPropagation();const e=null===(i=n.carousel)||void 0===i?void 0:i.plugins.Autoplay;let s=e.isActive;return a&&"mousemove"===a.panMode&&!s&&a.reset(),void(s?e.stop():e.start())}const c=l.panzoomAction,h=l.panzoomChange;if((h||c)&&(t.preventDefault(),t.stopPropagation()),h){let t={};try{t=JSON.parse(h)}catch(t){}a&&a.applyChange(t)}else c&&a&&a[c]&&a[c]()}onChange(){this.onRefresh()}onRefresh(){if(this.instance.isClosing())return;const t=this.container;if(!t)return;const e=this.instance.getSlide();if(!e||e.state!==f.Ready)return;const i=e&&!e.error&&e.panzoom;for(const e of t.querySelectorAll("[data-panzoom-action]"))i?(e.removeAttribute("disabled"),e.removeAttribute("tabindex")):(e.setAttribute("disabled",""),e.setAttribute("tabindex","-1"));let n=i&&i.canZoomIn(),s=i&&i.canZoomOut();for(const e of t.querySelectorAll('[data-panzoom-action="zoomIn"]'))n?(e.removeAttribute("disabled"),e.removeAttribute("tabindex")):(e.setAttribute("disabled",""),e.setAttribute("tabindex","-1"));for(const e of t.querySelectorAll('[data-panzoom-action="zoomOut"]'))s?(e.removeAttribute("disabled"),e.removeAttribute("tabindex")):(e.setAttribute("disabled",""),e.setAttribute("tabindex","-1"));for(const e of t.querySelectorAll('[data-panzoom-action="toggleZoom"],[data-panzoom-action="iterateZoom"]')){s||n?(e.removeAttribute("disabled"),e.removeAttribute("tabindex")):(e.setAttribute("disabled",""),e.setAttribute("tabindex","-1"));const t=e.querySelector("g");t&&(t.style.display=n?"":"none")}}onDone(t,e){var i;null===(i=e.panzoom)||void 0===i||i.on("afterTransform",(()=>{this.instance.isCurrentSlide(e)&&this.onRefresh()})),this.instance.isCurrentSlide(e)&&this.onRefresh()}createContainer(){const t=this.instance.container;if(!t)return null;const e=this.option("parentEl")||t,i=document.createElement("div");return F(i,"fancybox__toolbar"),e.prepend(i),i.addEventListener("click",this.onClick,{passive:!1,capture:!0}),t&&F(t,"has-toolbar"),this.container=i,i}createEl(t){var e;const i=this.instance.carousel;if(!i)return null;if("toggleFS"===t)return null;if("fullscreen"===t&&!this.instance.fsAPI)return null;let s=null;const o=i.slides.length||0;let a=0,r=0;for(const t of i.slides)(t.panzoom||"image"===t.type)&&a++,("image"===t.type||t.downloadSrc)&&r++;if(o<2&&["infobar","prev","next"].includes(t))return s;if(void 0!==ot[t]&&!a)return null;if("download"===t&&!r)return null;if("thumbs"===t){const t=this.instance.plugins.Thumbs;if(!t||!t.isEnabled)return null}if("slideshow"===t){if(!(null===(e=this.instance.carousel)||void 0===e?void 0:e.plugins.Autoplay)||o<2)return null}if(void 0!==ot[t]){const e=ot[t];s=document.createElement("button"),s.setAttribute("title",this.instance.localize(`{{${t.toUpperCase()}}}`)),F(s,"f-button"),e.action&&(s.dataset.panzoomAction=e.action),e.change&&(s.dataset.panzoomChange=JSON.stringify(e.change)),s.appendChild(n(this.instance.localize(e.icon)))}else{const e=(this.option("items")||[])[t];e&&(s=n(this.instance.localize(e.tpl)),"function"==typeof e.click&&s.addEventListener("click",(t=>{t.preventDefault(),t.stopPropagation(),"function"==typeof e.click&&e.click.call(this,this,t)})))}const l=null==s?void 0:s.querySelector("svg");if(l)for(const[t,e]of Object.entries(lt))l.getAttribute(t)||l.setAttribute(t,String(e));return s}removeContainer(){var t;const e=this.container;e&&e.removeEventListener("click",this.onClick,{passive:!1,capture:!0}),null===(t=this.container)||void 0===t||t.remove(),this.container=null,this.state=at.Disabled;const i=this.instance.container;i&&D(i,"has-toolbar")}attach(){this.instance.on("Carousel.initSlides",this.onReady),this.instance.on("done",this.onDone),this.instance.on("reveal",this.onChange),this.instance.on("Carousel.change",this.onChange),this.onReady(this.instance)}detach(){this.instance.off("Carousel.initSlides",this.onReady),this.instance.off("done",this.onDone),this.instance.off("reveal",this.onChange),this.instance.off("Carousel.change",this.onChange),this.removeContainer()}}Object.defineProperty(ct,"defaults",{enumerable:!0,configurable:!0,writable:!0,value:rt});const ht={Hash:w,Html:K,Images:Z,Slideshow:Q,Thumbs:st,Toolbar:ct},dt=function(t,e){let i=!0;return(...n)=>{i&&(i=!1,t(...n),setTimeout((()=>{i=!0}),e))}},ut=(t,e)=>{let i=[];return t.childNodes.forEach((t=>{t.nodeType!==Node.ELEMENT_NODE||e&&!t.matches(e)||i.push(t)})),i},pt={viewport:null,track:null,enabled:!0,slides:[],axis:"x",transition:"fade",preload:1,slidesPerPage:"auto",initialPage:0,friction:.12,Panzoom:{decelFriction:.12},center:!0,infinite:!0,fill:!0,dragFree:!1,adaptiveHeight:!1,direction:"ltr",classes:{container:"f-carousel",viewport:"f-carousel__viewport",track:"f-carousel__track",slide:"f-carousel__slide",isLTR:"is-ltr",isRTL:"is-rtl",isHorizontal:"is-horizontal",isVertical:"is-vertical",inTransition:"in-transition",isSelected:"is-selected"},l10n:{NEXT:"Next slide",PREV:"Previous slide",GOTO:"Go to slide #%d"}};var ft;!function(t){t[t.Init=0]="Init",t[t.Ready=1]="Ready",t[t.Destroy=2]="Destroy"}(ft||(ft={}));const mt=t=>{if("string"==typeof t&&(t={html:t}),!(t instanceof String||t instanceof HTMLElement)){const e=t.thumb;void 0!==e&&("string"==typeof e&&(t.thumbSrc=e),e instanceof HTMLImageElement&&(t.thumbEl=e,t.thumbElSrc=e.src,t.thumbSrc=e.src),delete t.thumb)}return Object.assign({html:"",el:null,isDom:!1,class:"",index:-1,dim:0,gap:0,pos:0,transition:!1},t)},gt=(t={})=>Object.assign({index:-1,slides:[],dim:0,pos:-1},t),bt={classes:{list:"f-carousel__dots",isDynamic:"is-dynamic",hasDots:"has-dots",dot:"f-carousel__dot",isBeforePrev:"is-before-prev",isPrev:"is-prev",isCurrent:"is-current",isNext:"is-next",isAfterNext:"is-after-next"},dotTpl:'<button type="button" data-carousel-page="%i" aria-label="{{GOTO}}"><span class="f-carousel__dot" aria-hidden="true"></span></button>',dynamicFrom:11,maxCount:1/0,minCount:2};class vt extends v{constructor(){super(...arguments),Object.defineProperty(this,"isDynamic",{enumerable:!0,configurable:!0,writable:!0,value:!1}),Object.defineProperty(this,"list",{enumerable:!0,configurable:!0,writable:!0,value:null})}onRefresh(){this.refresh()}build(){let t=this.list;return t||(t=document.createElement("ul"),F(t,this.cn("list")),t.setAttribute("role","tablist"),this.instance.container.appendChild(t),F(this.instance.container,this.cn("hasDots")),this.list=t),t}refresh(){var t;const e=this.instance.pages.length,i=Math.min(2,this.option("minCount")),n=Math.max(2e3,this.option("maxCount")),s=this.option("dynamicFrom");if(e<i||e>n)return void this.cleanup();const o="number"==typeof s&&e>5&&e>=s,a=!this.list||this.isDynamic!==o||this.list.children.length!==e;a&&this.cleanup();const r=this.build();if(M(r,this.cn("isDynamic"),!!o),a)for(let t=0;t<e;t++)r.append(this.createItem(t));let l,c=0;for(const e of[...r.children]){const i=c===this.instance.page;i&&(l=e),M(e,this.cn("isCurrent"),i),null===(t=e.children[0])||void 0===t||t.setAttribute("aria-selected",i?"true":"false");for(const t of["isBeforePrev","isPrev","isNext","isAfterNext"])D(e,this.cn(t));c++}if(l=l||r.firstChild,o&&l){const t=l.previousElementSibling,e=t&&t.previousElementSibling;F(t,this.cn("isPrev")),F(e,this.cn("isBeforePrev"));const i=l.nextElementSibling,n=i&&i.nextElementSibling;F(i,this.cn("isNext")),F(n,this.cn("isAfterNext"))}this.isDynamic=o}createItem(t=0){var e;const i=document.createElement("li");i.setAttribute("role","presentation");const s=n(this.instance.localize(this.option("dotTpl"),[["%d",t+1]]).replace(/\%i/g,t+""));return i.appendChild(s),null===(e=i.children[0])||void 0===e||e.setAttribute("role","tab"),i}cleanup(){this.list&&(this.list.remove(),this.list=null),this.isDynamic=!1,D(this.instance.container,this.cn("hasDots"))}attach(){this.instance.on(["refresh","change"],this.onRefresh)}detach(){this.instance.off(["refresh","change"],this.onRefresh),this.cleanup()}}Object.defineProperty(vt,"defaults",{enumerable:!0,configurable:!0,writable:!0,value:bt});class yt extends v{constructor(){super(...arguments),Object.defineProperty(this,"container",{enumerable:!0,configurable:!0,writable:!0,value:null}),Object.defineProperty(this,"prev",{enumerable:!0,configurable:!0,writable:!0,value:null}),Object.defineProperty(this,"next",{enumerable:!0,configurable:!0,writable:!0,value:null})}onRefresh(){const t=this.instance,e=t.pages.length,i=t.page;if(e<2)return void this.cleanup();this.build();let n=this.prev,s=this.next;n&&s&&(n.removeAttribute("disabled"),s.removeAttribute("disabled"),t.isInfinite||(i<=0&&n.setAttribute("disabled",""),i>=e-1&&s.setAttribute("disabled","")))}createButton(t){const e=this.instance,i=document.createElement("button");i.setAttribute("tabindex","0"),i.setAttribute("title",e.localize(`{{${t.toUpperCase()}}}`)),F(i,this.cn("button")+" "+this.cn("next"===t?"isNext":"isPrev"));const n=e.isRTL?"next"===t?"prev":"next":t;var s;return i.innerHTML=e.localize(this.option(`${n}Tpl`)),i.dataset[`carousel${s=t,s?s.match("^[a-z]")?s.charAt(0).toUpperCase()+s.substring(1):s:""}`]="true",i}build(){let t=this.container;t||(this.container=t=document.createElement("div"),F(t,this.cn("container")),this.instance.container.appendChild(t)),this.next||(this.next=t.appendChild(this.createButton("next"))),this.prev||(this.prev=t.appendChild(this.createButton("prev")))}cleanup(){this.prev&&this.prev.remove(),this.next&&this.next.remove(),this.container&&this.container.remove(),this.prev=null,this.next=null,this.container=null}attach(){this.instance.on(["refresh","change"],this.onRefresh)}detach(){this.instance.off(["refresh","change"],this.onRefresh),this.cleanup()}}Object.defineProperty(yt,"defaults",{enumerable:!0,configurable:!0,writable:!0,value:{classes:{container:"f-carousel__nav",button:"f-button",isNext:"is-next",isPrev:"is-prev"},nextTpl:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" tabindex="-1"><path d="M9 3l9 9-9 9"/></svg>',prevTpl:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" tabindex="-1"><path d="M15 3l-9 9 9 9"/></svg>'}});class wt extends v{constructor(){super(...arguments),Object.defineProperty(this,"selectedIndex",{enumerable:!0,configurable:!0,writable:!0,value:null}),Object.defineProperty(this,"target",{enumerable:!0,configurable:!0,writable:!0,value:null}),Object.defineProperty(this,"nav",{enumerable:!0,configurable:!0,writable:!0,value:null})}addAsTargetFor(t){this.target=this.instance,this.nav=t,this.attachEvents()}addAsNavFor(t){this.nav=this.instance,this.target=t,this.attachEvents()}attachEvents(){this.nav&&this.target&&(this.nav.options.initialSlide=this.target.options.initialPage,this.nav.on("ready",this.onNavReady),this.nav.state===ft.Ready&&this.onNavReady(this.nav),this.target.on("ready",this.onTargetReady),this.target.state===ft.Ready&&this.onTargetReady(this.target))}onNavReady(t){t.on("createSlide",this.onNavCreateSlide),t.on("Panzoom.click",this.onNavClick),t.on("Panzoom.touchEnd",this.onNavTouch),this.onTargetChange()}onTargetReady(t){t.on("change",this.onTargetChange),t.on("Panzoom.refresh",this.onTargetChange),this.onTargetChange()}onNavClick(t,e,i){i.pointerType||this.onNavTouch(t,t.panzoom,i)}onNavTouch(t,e,i){var n,s;if(Math.abs(e.dragOffset.x)>3||Math.abs(e.dragOffset.y)>3)return;const o=i.target,{nav:a,target:r}=this;if(!a||!r||!o)return;const l=o.closest("[data-index]");if(i.stopPropagation(),i.preventDefault(),!l)return;const c=parseInt(l.dataset.index||"",10)||0,h=r.getPageForSlide(c),d=a.getPageForSlide(c);a.slideTo(d),r.slideTo(h,{friction:null===(s=null===(n=this.nav)||void 0===n?void 0:n.plugins)||void 0===s?void 0:s.Sync.option("friction")}),this.markSelectedSlide(c)}onNavCreateSlide(t,e){e.index===this.selectedIndex&&this.markSelectedSlide(e.index)}onTargetChange(){const{target:t,nav:e}=this;if(!t||!e)return;if(e.state!==ft.Ready||t.state!==ft.Ready)return;const i=t.pages[t.page].slides[0].index,n=e.getPageForSlide(i);this.markSelectedSlide(i),e.slideTo(n)}markSelectedSlide(t){const{nav:e}=this;e&&e.state===ft.Ready&&(this.selectedIndex=t,[...e.slides].map((e=>{e.el&&e.el.classList[e.index===t?"add":"remove"]("is-nav-selected")})))}attach(){let t=this.options.target,e=this.options.nav;t?this.addAsNavFor(t):e&&this.addAsTargetFor(e)}detach(){this.nav&&(this.nav.off("ready",this.onNavReady),this.nav.off("createSlide",this.onNavCreateSlide),this.nav.off("Panzoom.click",this.onNavClick),this.nav.off("Panzoom.touchEnd",this.onNavTouch)),this.nav=null,this.target&&(this.target.off("ready",this.onTargetReady),this.target.off("refresh",this.onTargetChange),this.target.off("change",this.onTargetChange)),this.target=null}}Object.defineProperty(wt,"defaults",{enumerable:!0,configurable:!0,writable:!0,value:{friction:.35}});const xt={Navigation:yt,Dots:vt,Sync:wt};class Et extends b{get axis(){return this.isHorizontal?"e":"f"}get isEnabled(){return this.state===ft.Ready}get isInfinite(){let t=!1;const e=this.contentDim,i=this.viewportDim;return this.pages.length>=2&&e>1.5*i&&(t=this.option("infinite")),t}get isRTL(){return"rtl"===this.option("direction")}get isHorizontal(){return"x"===this.option("axis")}constructor(t,e={},i={}){if(super(),Object.defineProperty(this,"userOptions",{enumerable:!0,configurable:!0,writable:!0,value:{}}),Object.defineProperty(this,"userPlugins",{enumerable:!0,configurable:!0,writable:!0,value:{}}),Object.defineProperty(this,"bp",{enumerable:!0,configurable:!0,writable:!0,value:""}),Object.defineProperty(this,"lp",{enumerable:!0,configurable:!0,writable:!0,value:0}),Object.defineProperty(this,"state",{enumerable:!0,configurable:!0,writable:!0,value:ft.Init}),Object.defineProperty(this,"page",{enumerable:!0,configurable:!0,writable:!0,value:0}),Object.defineProperty(this,"prevPage",{enumerable:!0,configurable:!0,writable:!0,value:null}),Object.defineProperty(this,"container",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"viewport",{enumerable:!0,configurable:!0,writable:!0,value:null}),Object.defineProperty(this,"track",{enumerable:!0,configurable:!0,writable:!0,value:null}),Object.defineProperty(this,"slides",{enumerable:!0,configurable:!0,writable:!0,value:[]}),Object.defineProperty(this,"pages",{enumerable:!0,configurable:!0,writable:!0,value:[]}),Object.defineProperty(this,"panzoom",{enumerable:!0,configurable:!0,writable:!0,value:null}),Object.defineProperty(this,"inTransition",{enumerable:!0,configurable:!0,writable:!0,value:new Set}),Object.defineProperty(this,"contentDim",{enumerable:!0,configurable:!0,writable:!0,value:0}),Object.defineProperty(this,"viewportDim",{enumerable:!0,configurable:!0,writable:!0,value:0}),"string"==typeof t&&(t=document.querySelector(t)),!t||!s(t))throw new Error("No Element found");this.container=t,this.slideNext=dt(this.slideNext.bind(this),150),this.slidePrev=dt(this.slidePrev.bind(this),150),this.userOptions=e,this.userPlugins=i,queueMicrotask((()=>{this.processOptions()}))}processOptions(){const t=i({},Et.defaults,this.userOptions);let n="";const s=t.breakpoints;if(s&&e(s))for(const[o,a]of Object.entries(s))window.matchMedia(o).matches&&e(a)&&(n+=o,i(t,a));n===this.bp&&this.state!==ft.Init||(this.bp=n,this.state===ft.Ready&&(t.initialSlide=this.pages[this.page].slides[0].index),this.state!==ft.Init&&this.destroy(),super.setOptions(t),!1===this.option("enabled")?this.attachEvents():setTimeout((()=>{this.init()}),0))}init(){this.state=ft.Init,this.emit("init"),this.attachPlugins(Object.assign(Object.assign({},Et.Plugins),this.userPlugins)),this.initLayout(),this.initSlides(),this.updateMetrics(),this.setInitialPosition(),this.initPanzoom(),this.attachEvents(),this.state=ft.Ready,this.emit("ready")}initLayout(){const{container:t}=this,e=this.option("classes");F(t,this.cn("container")),M(t,e.isLTR,!this.isRTL),M(t,e.isRTL,this.isRTL),M(t,e.isVertical,!this.isHorizontal),M(t,e.isHorizontal,this.isHorizontal);let i=this.option("viewport")||t.querySelector(`.${e.viewport}`);i||(i=document.createElement("div"),F(i,e.viewport),i.append(...ut(t,`.${e.slide}`)),t.prepend(i));let n=this.option("track")||t.querySelector(`.${e.track}`);n||(n=document.createElement("div"),F(n,e.track),n.append(...Array.from(i.childNodes))),n.setAttribute("aria-live","polite"),i.contains(n)||i.prepend(n),this.viewport=i,this.track=n,this.emit("initLayout")}initSlides(){const{track:t}=this;if(t){this.slides=[],[...ut(t,`.${this.cn("slide")}`)].forEach((t=>{if(s(t)){const e=mt({el:t,isDom:!0,index:this.slides.length});this.slides.push(e),this.emit("initSlide",e,this.slides.length)}}));for(let t of this.option("slides",[])){const e=mt(t);e.index=this.slides.length,this.slides.push(e),this.emit("initSlide",e,this.slides.length)}this.emit("initSlides")}}setInitialPage(){let t=0;const e=this.option("initialSlide");t="number"==typeof e?this.getPageForSlide(e):parseInt(this.option("initialPage",0)+"",10)||0,this.page=t}setInitialPosition(){if(!this.track||!this.pages.length)return;const t=this.isHorizontal;let e=this.page;this.pages[e]||(this.page=e=0);const i=this.pages[e].pos*(this.isRTL&&t?1:-1),n=t?`${i}px`:"0",s=t?"0":`${i}px`;this.track.style.transform=`translate3d(${n}, ${s}, 0) scale(1)`,this.option("adaptiveHeight")&&this.setViewportHeight()}initPanzoom(){this.panzoom&&(this.panzoom.destroy(),this.panzoom=null);const t=this.option("Panzoom")||{};this.panzoom=new Y(this.viewport,i({},{content:this.track,zoom:!1,panOnlyZoomed:!1,lockAxis:this.isHorizontal?"x":"y",infinite:this.isInfinite,click:!1,dblClick:!1,touch:t=>!(this.pages.length<2&&!t.options.infinite),bounds:()=>this.getBounds(),maxVelocity:t=>Math.abs(t.target[this.axis]-t.current[this.axis])<2*this.viewportDim?100:0},t)),this.panzoom.on("*",((t,e,...i)=>{this.emit(`Panzoom.${e}`,t,...i)})),this.panzoom.on("decel",this.onDecel),this.panzoom.on("refresh",this.onRefresh),this.panzoom.on("beforeTransform",this.onBeforeTransform),this.panzoom.on("endAnimation",this.onEndAnimation)}attachEvents(){const t=this.container;t&&(t.addEventListener("click",this.onClick,{passive:!1,capture:!1}),t.addEventListener("slideTo",this.onSlideTo)),window.addEventListener("resize",this.onResize)}createPages(){let t=[];const{contentDim:e,viewportDim:i}=this,n=this.option("slidesPerPage");if("number"==typeof n&&e>i){for(let e=0;e<this.slides.length;e+=n)t.push(gt({index:e,slides:this.slides.slice(e,e+n)}));return t}let s=0,o=0;for(const e of this.slides)(!t.length||o+e.dim>i)&&(t.push(gt()),s=t.length-1,o=0),o+=e.dim+e.gap,t[s].slides.push(e);return t}processPages(){const t=this.pages,{contentDim:e,viewportDim:i}=this,n=this.option("center"),s=this.option("fill"),o=s&&n&&e>i&&!this.isInfinite;if(t.forEach(((t,s)=>{t.index=s,t.pos=t.slides[0].pos,t.dim=0;for(const[e,i]of t.slides.entries())t.dim+=i.dim,e<t.slides.length-1&&(t.dim+=i.gap);o&&t.pos+.5*t.dim<.5*i?t.pos=0:o&&t.pos+.5*t.dim>=e-.5*i?t.pos=e-i:n&&(t.pos+=-.5*(i-t.dim))})),t.forEach(((t,n)=>{s&&!this.isInfinite&&e>i&&(t.pos=Math.max(t.pos,0),t.pos=Math.min(t.pos,e-i)),t.pos=E(t.pos,1e3),t.dim=E(t.dim,1e3),t.pos<.1&&t.pos>-.1&&(t.pos=0)})),this.isInfinite)return t;const a=[];let r;return t.forEach((t=>{const e=Object.assign({},t);r&&e.pos===r.pos?(r.dim+=e.dim,r.slides=[...r.slides,...e.slides]):(e.index=a.length,r=e,a.push(e))})),a}getPageFromIndex(t=0){const e=this.pages.length;let i;return t=parseInt((t||0).toString())||0,i=this.isInfinite?(t%e+e)%e:Math.max(Math.min(t,this.pages.length-1),0),i}getSlideMetrics(t){const e=this.isHorizontal?"width":"height";let i=0,n=0,s=t.el;s?i=parseFloat(s.dataset[e]||"")||0:(s=document.createElement("div"),s.style.visibility="hidden",F(s,this.cn("slide")+" "+t.class),(this.track||document.body).prepend(s)),i?(s.style[e]=`${i}px`,s.style["width"===e?"height":"width"]=""):i=s.getBoundingClientRect()[e];const o=getComputedStyle(s);return"content-box"===o.boxSizing&&(this.isHorizontal?(i+=parseFloat(o.paddingLeft)||0,i+=parseFloat(o.paddingRight)||0):(i+=parseFloat(o.paddingTop)||0,i+=parseFloat(o.paddingBottom)||0)),n=parseFloat(o[this.isHorizontal?"marginRight":"marginBottom"])||0,this.isHorizontal,t.el||s.remove(),{dim:E(i,1e3),gap:E(n,1e3)}}getBounds(){let t={min:0,max:0};if(this.isInfinite)t={min:-1/0,max:1/0};else if(this.pages.length){const e=this.pages[0].pos,i=this.pages[this.pages.length-1].pos;t=this.isRTL&&this.isHorizontal?{min:e,max:i}:{min:-1*i,max:-1*e}}return{x:this.isHorizontal?t:{min:0,max:0},y:this.isHorizontal?{min:0,max:0}:t}}repositionSlides(){let t,{viewport:e,viewportDim:i,contentDim:n,page:s,pages:o}=this,a=0,r=0,l=0,c=0;this.panzoom?c=-1*this.panzoom.current[this.axis]:o[s]&&(c=o[s].pos||0),t=this.isHorizontal?this.isRTL?"right":"left":"top",this.isRTL&&this.isHorizontal&&(c*=-1);for(const e of this.slides)e.el?("top"===t?(e.el.style.right="",e.el.style.left=""):e.el.style.top="",e.index!==a?e.el.style[t]=0===r?"":`${E(r,1e3)}px`:e.el.style[t]="",l+=e.dim+e.gap,a++):r+=e.dim+e.gap;if(this.isInfinite&&l&&e){const s=this.isHorizontal;let o=getComputedStyle(e),a="padding",h=s?"Right":"Bottom",d=parseFloat(o[a+(s?"Left":"Top")]);c-=d,i+=d,i+=parseFloat(o[a+h]);for(const e of this.slides)e.el&&(E(e.pos)<E(i)&&E(e.pos+e.dim+e.gap)<E(c)&&E(c)>E(n-i)&&(e.el.style[t]=`${E(r+l,1e3)}px`),E(e.pos+e.gap)>=E(n-i)&&E(e.pos)>E(c+i)&&E(c)<E(i)&&(e.el.style[t]=`-${E(l,1e3)}px`))}let h,d,u=[...this.inTransition];if(u.length>1&&(h=this.pages[u[0]],d=this.pages[u[1]]),h&&d){let e=0;for(const i of this.slides)i.el?this.inTransition.has(i.index)&&h.slides.indexOf(i)<0&&(i.el.style[t]=`${E(e+(h.pos-d.pos),1e3)}px`):e+=i.dim+i.gap}}createSlideEl(t){if(!this.track||!t)return;if(t.el)return;const e=document.createElement("div");F(e,this.cn("slide")),F(e,t.class),F(e,t.customClass),t.html&&(e.innerHTML=t.html);const i=[];this.slides.forEach(((t,e)=>{t.el&&i.push(e)}));const n=t.index;let s=null;if(i.length){let t=i.reduce(((t,e)=>Math.abs(e-n)<Math.abs(t-n)?e:t));s=this.slides[t]}const o=s&&s.el?s.index<t.index?s.el.nextSibling:s.el:null;this.track.insertBefore(e,this.track.contains(o)?o:null),t.el=e,this.emit("createSlide",t)}removeSlideEl(t,e=!1){const i=t.el;if(!i)return;if(D(i,this.cn("isSelected")),t.isDom&&!e)return i.removeAttribute("aria-hidden"),i.removeAttribute("data-index"),D(i,this.cn("isSelected")),void(i.style.left="");this.emit("removeSlide",t);const n=new CustomEvent("animationend");i.dispatchEvent(n),t.el&&t.el.remove(),t.el=null}transitionTo(t=0,e=this.option("transition")){if(!e)return!1;const{pages:i,panzoom:n}=this;t=parseInt((t||0).toString())||0;const s=this.getPageFromIndex(t);if(!n||!i[s]||i.length<2||i[this.page].slides[0].dim<this.viewportDim)return!1;const o=t>this.page?1:-1,a=this.pages[s].pos*(this.isRTL?1:-1);if(this.page===s&&E(a,1e3)===E(n.target[this.axis],1e3))return!1;this.clearTransitions();const r=n.isResting;F(this.container,this.cn("inTransition"));const l=this.pages[this.page].slides[0],c=this.pages[s].slides[0];this.inTransition.add(c.index),this.createSlideEl(c);let h=l.el,d=c.el;r||"slide"===e||(e="fadeFast",h=null);const u=this.isRTL?"next":"prev",p=this.isRTL?"prev":"next";return h&&(this.inTransition.add(l.index),l.transition=e,h.addEventListener("animationend",this.onAnimationEnd),h.classList.add(`f-${e}Out`,`to-${o>0?p:u}`)),d&&(c.transition=e,d.addEventListener("animationend",this.onAnimationEnd),d.classList.add(`f-${e}In`,`from-${o>0?u:p}`)),n.panTo({x:this.isHorizontal?a:0,y:this.isHorizontal?0:a,friction:0}),this.onChange(s),!0}manageSlideVisiblity(){const t=new Set,e=new Set,i=this.getVisibleSlides(parseFloat(this.option("preload",0)+"")||0);for(const n of this.slides)i.has(n)?t.add(n):e.add(n);for(const e of this.inTransition)t.add(this.slides[e]);for(const e of t)this.createSlideEl(e),this.lazyLoadSlide(e);for(const i of e)t.has(i)||this.removeSlideEl(i);this.markSelectedSlides(),this.repositionSlides()}markSelectedSlides(){if(!this.pages[this.page]||!this.pages[this.page].slides)return;const t="aria-hidden";let e=this.cn("isSelected");if(e)for(const i of this.slides)i.el&&(i.el.dataset.index=`${i.index}`,this.pages[this.page].slides.includes(i)?(i.el.classList.contains(e)||(F(i.el,e),this.emit("selectSlide",i)),i.el.removeAttribute(t)):(i.el.classList.contains(e)&&(D(i.el,e),this.emit("unselectSlide",i)),i.el.setAttribute(t,"true")))}flipInfiniteTrack(){const t=this.panzoom;if(!t||!this.isInfinite)return;const e="x"===this.option("axis")?"e":"f",{viewportDim:i,contentDim:n}=this;let s=t.current[e],o=t.target[e]-s,a=0,r=.5*i,l=n;this.isRTL&&this.isHorizontal?(s<-r&&(a=-1,s+=l),s>l-r&&(a=1,s-=l)):(s>r&&(a=1,s-=l),s<-l+r&&(a=-1,s+=l)),a&&(t.current[e]=s,t.target[e]=s+o)}lazyLoadSlide(t){const e=this,i=t&&t.el;if(!i)return;const o=new Set,a="f-fadeIn";i.querySelectorAll("[data-lazy-srcset]").forEach((t=>{t instanceof HTMLImageElement&&o.add(t)}));let r=Array.from(i.querySelectorAll("[data-lazy-src]"));i.dataset.lazySrc&&r.push(i),r.map((t=>{t instanceof HTMLImageElement?o.add(t):s(t)&&(t.style.backgroundImage=`url('${t.dataset.lazySrc||""}')`,delete t.dataset.lazySrc)}));const l=(t,i,n)=>{n&&(n.remove(),n=null),i.complete&&(i.classList.add(a),setTimeout((()=>{i.classList.remove(a)}),350),i.style.display=""),this.option("adaptiveHeight")&&t.el&&this.pages[this.page].slides.indexOf(t)>-1&&(e.updateMetrics(),e.setViewportHeight()),this.emit("load",t)};for(const e of o){let i=null;e.src=e.dataset.lazySrcset||e.dataset.lazySrc||"",delete e.dataset.lazySrc,delete e.dataset.lazySrcset,e.style.display="none",e.addEventListener("error",(()=>{l(t,e,i)})),e.addEventListener("load",(()=>{l(t,e,i)})),setTimeout((()=>{e.parentNode&&t.el&&(e.complete?l(t,e,i):(i=n(h),e.parentNode.insertBefore(i,e)))}),300)}}onAnimationEnd(t){var e;const i=t.target,n=i?parseInt(i.dataset.index||"",10)||0:-1,s=this.slides[n],o=t.animationName;if(!i||!s||!o)return;const a=!!this.inTransition.has(n)&&s.transition;a&&o.substring(0,a.length+2)===`f-${a}`&&this.inTransition.delete(n),this.inTransition.size||this.clearTransitions(),n===this.page&&(null===(e=this.panzoom)||void 0===e?void 0:e.isResting)&&this.emit("settle")}onDecel(t,e=0,i=0,n=0,s=0){const o=this.isRTL,a=this.isHorizontal,r=this.axis,l=this.pages.length,c=Math.abs(Math.atan2(i,e)/(Math.PI/180));let h=0;if(h=c>45&&c<135?a?0:i:a?e:0,!l)return;const d=this.option("dragFree");let u=this.page;const p=t.target[r]*(this.isRTL&&a?1:-1),{pageIndex:f}=this.getPageFromPosition(p),m=t.current[r]*(o&&a?1:-1);let{page:g}=this.getPageFromPosition(m);d?this.onChange(f):(Math.abs(h)>5?((this.pages.length<3||Math.max(Math.abs(n),Math.abs(s))>this.pages[u].slides[0].dim)&&(u=g),u=o&&a?h<0?u-1:u+1:h<0?u+1:u-1):u=g,this.slideTo(u,{transition:!1,friction:t.option("decelFriction")}))}onClick(t){const e=t.target,i=e&&s(e)?e.dataset:null;let n,o;i&&(void 0!==i.carouselPage?(o="slideTo",n=i.carouselPage):void 0!==i.carouselNext?o="slideNext":void 0!==i.carouselPrev&&(o="slidePrev")),o?(t.preventDefault(),t.stopPropagation(),e&&!e.hasAttribute("disabled")&&this[o](n)):this.emit("click",t)}onSlideTo(t){const e=t.detail||0;this.slideTo(this.getPageForSlide(e),{friction:0})}onChange(t,e=0){const i=this.page;this.prevPage=i,this.page=t,this.option("adaptiveHeight")&&this.setViewportHeight(),t!==i&&(this.markSelectedSlides(),this.emit("change",t,i,e))}onRefresh(){let t=this.contentDim,e=this.viewportDim;this.updateMetrics(),this.contentDim===t&&this.viewportDim===e||this.slideTo(this.page,{friction:0,transition:!1})}onResize(){this.option("breakpoints")&&this.processOptions()}onBeforeTransform(t){this.lp!==t.current[this.axis]&&(this.flipInfiniteTrack(),this.manageSlideVisiblity()),this.lp=t.current.e}onEndAnimation(){this.inTransition.size||this.emit("settle")}reInit(t=null,e=null){this.destroy(),this.state=ft.Init,this.userOptions=t||this.userOptions,this.userPlugins=e||this.userPlugins,this.processOptions()}slideTo(t=0,{friction:e=this.option("friction"),transition:i=this.option("transition")}={}){if(this.state===ft.Destroy)return;const n=this.panzoom,s=this.pages.length;if(!n||!s)return;if(this.transitionTo(t,i))return;const o=this.axis,a=this.getPageFromIndex(t);let r=this.pages[a].pos,l=0;if(this.isInfinite){const t=n.current[o]*(this.isRTL&&this.isHorizontal?1:-1),e=this.contentDim,i=r+e,s=r-e;Math.abs(t-i)<Math.abs(t-r)&&(r=i,l=1),Math.abs(t-s)<Math.abs(t-r)&&(r=s,l=-1)}r*=this.isRTL&&this.isHorizontal?1:-1,Math.abs(n.target[o]-r)<.1||(n.panTo({x:this.isHorizontal?r:0,y:this.isHorizontal?0:r,friction:e}),this.onChange(a,l))}slideToClosest(t){if(this.panzoom){const{pageIndex:e}=this.getPageFromPosition(this.panzoom.current[this.isHorizontal?"e":"f"]);this.slideTo(e,t)}}slideNext(){this.slideTo(this.page+1)}slidePrev(){this.slideTo(this.page-1)}clearTransitions(){this.inTransition.clear(),D(this.container,this.cn("inTransition"));const t=["to-prev","to-next","from-prev","from-next"];for(const e of this.slides){const i=e.el;if(i){i.removeEventListener("animationend",this.onAnimationEnd),i.classList.remove(...t);const n=e.transition;n&&i.classList.remove(`f-${n}Out`,`f-${n}In`)}}this.manageSlideVisiblity()}prependSlide(t){var e,i;let n=Array.isArray(t)?t:[t];for(const t of n.reverse())this.slides.unshift(mt(t));for(let t=0;t<this.slides.length;t++)this.slides[t].index=t;const s=(null===(e=this.pages[this.page])||void 0===e?void 0:e.pos)||0;this.page+=n.length,this.updateMetrics();const o=(null===(i=this.pages[this.page])||void 0===i?void 0:i.pos)||0;if(this.panzoom){const t=this.isRTL?s-o:o-s;this.panzoom.target.e-=t,this.panzoom.current.e-=t,this.panzoom.requestTick()}}appendSlide(t){let e=Array.isArray(t)?t:[t];for(const t of e){const e=mt(t);e.index=this.slides.length,this.slides.push(e),this.emit("initSlide",t,this.slides.length)}this.updateMetrics()}removeSlide(t){const e=this.slides.length;t=(t%e+e)%e,this.removeSlideEl(this.slides[t],!0),this.slides.splice(t,1);for(let t=0;t<this.slides.length;t++)this.slides[t].index=t;this.updateMetrics(),this.slideTo(this.page,{friction:0,transition:!1})}updateMetrics(){const{panzoom:t,viewport:e,track:i,isHorizontal:n}=this;if(!i)return;const s=n?"width":"height";if(e){let t=E(e.getBoundingClientRect()[s],1e3),i=getComputedStyle(e),o="padding",a=n?"Right":"Bottom";t-=parseFloat(i[o+(n?"Left":"Top")])+parseFloat(i[o+a]),this.viewportDim=t}let o,a=this.pages.length,r=0;for(const[t,e]of this.slides.entries()){let i=0,n=0;!e.el&&o?(i=o.dim,n=o.gap):(({dim:i,gap:n}=this.getSlideMetrics(e)),o=e),i=E(i,1e3),n=E(n,1e3),e.dim=i,e.gap=n,e.pos=r,r+=i,(this.isInfinite||t<this.slides.length-1)&&(r+=n)}const l=this.contentDim;r=E(r,1e3),this.contentDim=r,t&&(t.contentRect[s]=r,t.contentRect["e"===this.axis?"fullWidth":"fullHeight"]=r),this.pages=this.createPages(),this.pages=this.processPages(),this.state===ft.Init&&this.setInitialPage(),this.page=Math.max(0,Math.min(this.page,this.pages.length-1)),t&&a===this.pages.length&&Math.abs(r-l)>.5&&(t.target[this.axis]=-1*this.pages[this.page].pos,t.current[this.axis]=-1*this.pages[this.page].pos,t.stop()),this.manageSlideVisiblity(),this.emit("refresh")}getProgress(t,e=!1){void 0===t&&(t=this.page);const i=this,n=i.panzoom,s=i.pages[t]||0;if(!s||!n)return 0;let o=-1*n.current.e,a=i.contentDim;var r=[E((o-s.pos)/(1*s.dim),1e3),E((o+a-s.pos)/(1*s.dim),1e3),E((o-a-s.pos)/(1*s.dim),1e3)].reduce((function(t,e){return Math.abs(e)<Math.abs(t)?e:t}));return e?r:Math.max(-1,Math.min(1,r))}setViewportHeight(){const{page:t,pages:e,viewport:i,isHorizontal:n}=this;if(!i||!e[t])return;let s=0;n&&this.track&&(this.track.style.height="auto",e[t].slides.forEach((t=>{t.el&&(s=Math.max(s,t.el.offsetHeight))}))),i.style.height=s?`${s}px`:""}getPageForSlide(t){for(const e of this.pages)for(const i of e.slides)if(i.index===t)return e.index;return-1}getVisibleSlides(t=0){var e;const i=new Set;let{contentDim:n,viewportDim:s,pages:o,page:a}=this;n=n+(null===(e=this.slides[this.slides.length-1])||void 0===e?void 0:e.gap)||0;let r=0;r=this.panzoom?-1*this.panzoom.current[this.axis]:o[a]&&o[a].pos||0,this.isInfinite&&(r-=Math.floor(r/n)*n),this.isRTL&&this.isHorizontal&&(r*=-1);const l=r-s*t,c=r+s*(t+1),h=this.isInfinite?[-1,0,1]:[0];for(const t of this.slides)for(const e of h){const s=t.pos+e*n,o=t.pos+t.dim+t.gap+e*n;s<c&&o>l&&i.add(t)}return i}getPageFromPosition(t){const{viewportDim:e,contentDim:i}=this,n=this.pages.length,s=this.slides.length,o=this.slides[s-1];let a=0,r=0,l=0;const c=this.option("center");c&&(t+=.5*e),this.isInfinite||(t=Math.max(this.slides[0].pos,Math.min(t,o.pos)));const h=i+o.gap;l=Math.floor(t/h)||0,t-=l*h;let d=o,u=this.slides.find((e=>{const i=t+(d&&!c?.5*d.dim:0);return d=e,e.pos<=i&&e.pos+e.dim+e.gap>i}));return u||(u=o),r=this.getPageForSlide(u.index),a=r+l*n,{page:a,pageIndex:r}}destroy(){if([ft.Destroy].includes(this.state))return;this.state=ft.Destroy;const{container:t,viewport:e,track:i,slides:n,panzoom:s}=this,o=this.option("classes");t.removeEventListener("click",this.onClick,{passive:!1,capture:!1}),t.removeEventListener("slideTo",this.onSlideTo),window.removeEventListener("resize",this.onResize),s&&(s.destroy(),this.panzoom=null),n&&n.forEach((t=>{this.removeSlideEl(t)})),this.detachPlugins(),this.track=null,this.viewport=null,this.page=0,e&&i&&e.replaceWith(...i.childNodes);for(const[e,i]of Object.entries(o))"container"!==e&&i&&t.classList.remove(i);this.slides=[];const a=this.events.get("ready");this.events=new Map,a&&this.events.set("ready",a)}}Object.defineProperty(Et,"Panzoom",{enumerable:!0,configurable:!0,writable:!0,value:Y}),Object.defineProperty(Et,"defaults",{enumerable:!0,configurable:!0,writable:!0,value:pt}),Object.defineProperty(Et,"Plugins",{enumerable:!0,configurable:!0,writable:!0,value:xt});const St="with-fancybox",Pt="hide-scrollbar",Ct="--fancybox-scrollbar-compensate",Mt="--fancybox-body-margin",Tt="is-animated",Ot="is-compact",At="is-loading";let zt=null,Lt=null;const Rt=new Map;let kt=0;class It extends b{get isIdle(){return this.idle}get isCompact(){return this.option("compact")}constructor(t=[],e={},i={}){super(e),Object.defineProperty(this,"userSlides",{enumerable:!0,configurable:!0,writable:!0,value:[]}),Object.defineProperty(this,"userPlugins",{enumerable:!0,configurable:!0,writable:!0,value:{}}),Object.defineProperty(this,"idle",{enumerable:!0,configurable:!0,writable:!0,value:!1}),Object.defineProperty(this,"idleTimer",{enumerable:!0,configurable:!0,writable:!0,value:null}),Object.defineProperty(this,"clickTimer",{enumerable:!0,configurable:!0,writable:!0,value:null}),Object.defineProperty(this,"pwt",{enumerable:!0,configurable:!0,writable:!0,value:0}),Object.defineProperty(this,"ignoreFocusChange",{enumerable:!0,configurable:!0,writable:!0,value:!1}),Object.defineProperty(this,"state",{enumerable:!0,configurable:!0,writable:!0,value:p.Init}),Object.defineProperty(this,"id",{enumerable:!0,configurable:!0,writable:!0,value:0}),Object.defineProperty(this,"container",{enumerable:!0,configurable:!0,writable:!0,value:null}),Object.defineProperty(this,"footer",{enumerable:!0,configurable:!0,writable:!0,value:null}),Object.defineProperty(this,"caption",{enumerable:!0,configurable:!0,writable:!0,value:null}),Object.defineProperty(this,"carousel",{enumerable:!0,configurable:!0,writable:!0,value:null}),Object.defineProperty(this,"lastFocus",{enumerable:!0,configurable:!0,writable:!0,value:null}),Object.defineProperty(this,"prevMouseMoveEvent",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"fsAPI",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),this.fsAPI=(()=>{let t,e="",i="",n="";return document.fullscreenEnabled?(e="requestFullscreen",i="exitFullscreen",n="fullscreenElement"):document.webkitFullscreenEnabled&&(e="webkitRequestFullscreen",i="webkitExitFullscreen",n="webkitFullscreenElement"),e&&(t={request:function(t){return"webkitRequestFullscreen"===e?t[e](Element.ALLOW_KEYBOARD_INPUT):t[e]()},exit:function(){return document[n]&&document[i]()},isFullscreen:function(){return document[n]}}),t})(),this.id=e.id||++kt,Rt.set(this.id,this),this.userSlides=t,this.userPlugins=i,queueMicrotask((()=>{this.init()}))}init(){if(this.state===p.Destroy)return;this.state=p.Init,this.attachPlugins(Object.assign(Object.assign({},It.Plugins),this.userPlugins)),this.emit("init"),!0===this.option("hideScrollbar")&&(()=>{if(!a)return;const t=document.body;if(t.classList.contains(Pt))return;const e=window.innerWidth-document.documentElement.getBoundingClientRect().width,i=t.currentStyle||window.getComputedStyle(t),n=parseFloat(i.marginRight);document.documentElement.style.setProperty(Ct,`${e}px`),n&&t.style.setProperty(Mt,`${n}px`),t.classList.add(Pt)})(),this.initLayout();const t=()=>{this.initCarousel(this.userSlides),this.state=p.Ready,this.attachEvents(),this.emit("ready"),setTimeout((()=>{this.container&&this.container.setAttribute("aria-hidden","false")}),16)};this.option("Fullscreen.autoStart")&&this.fsAPI&&!this.fsAPI.isFullscreen()?this.fsAPI.request(this.container).then((()=>t())).catch((()=>t())):t()}initLayout(){const t=this.option("parentEl")||document.body,e=n(this.localize(this.option("tpl.main")||""));e&&(e.setAttribute("id",`fancybox-${this.id}`),e.setAttribute("aria-label",this.localize("{{MODAL}}")),e.classList.toggle(Ot,this.isCompact),F(e,this.option("mainClass")||""),this.container=e,this.footer=e.querySelector(".fancybox__footer"),t.appendChild(e),F(document.documentElement,St),zt&&Lt||(zt=document.createElement("span"),F(zt,"fancybox-focus-guard"),zt.setAttribute("tabindex","0"),zt.setAttribute("aria-hidden","true"),zt.setAttribute("aria-label","Focus guard"),Lt=zt.cloneNode(),document.body.insertBefore(zt,e),document.body.append(Lt)),this.option("animated")&&(F(e,Tt),setTimeout((()=>{this.isClosing()||D(e,Tt)}),350)),this.emit("initLayout"))}initCarousel(t){const e=this.container;if(!e)return;const n=e.querySelector(".fancybox__carousel");if(!n)return;const s=this.carousel=new Et(n,i({},{slides:t,transition:"fade",Panzoom:{lockAxis:this.option("dragToClose")?"xy":"x",infinite:!!this.option("dragToClose")&&"y"},Dots:!1,Navigation:{classes:{container:"fancybox__nav",button:"f-button",isNext:"is-next",isPrev:"is-prev"}},initialPage:this.option("startIndex"),l10n:this.option("l10n")},this.option("Carousel")||{}));s.on("*",((t,e,...i)=>{this.emit(`Carousel.${e}`,t,...i)})),s.on(["ready","change"],(()=>{var t;const e=this.getSlide();e&&(null===(t=e.panzoom)||void 0===t||t.updateControls()),this.manageCaption(e)})),s.on("removeSlide",((t,e)=>{e.closeBtnEl&&e.closeBtnEl.remove(),e.closeBtnEl=void 0,e.captionEl&&e.captionEl.remove(),e.captionEl=void 0,e.spinnerEl&&e.spinnerEl.remove(),e.spinnerEl=void 0,e.state=void 0})),s.on("Panzoom.touchStart",(()=>{this.isCompact||this.endIdle()})),s.on("settle",(()=>{this.idleTimer||this.isCompact||!this.option("idle")||this.setIdle(),this.option("autoFocus")&&this.checkFocus()})),this.option("dragToClose")&&(s.on("Panzoom.afterTransform",((t,e)=>{const i=this.getSlide();if(i&&S(i.el))return;const n=this.container;if(n){const t=Math.abs(e.current.f),i=t<1?"":Math.max(.5,Math.min(1,1-t/e.contentRect.fitHeight*1.5));n.style.setProperty("--fancybox-ts",i?"0s":""),n.style.setProperty("--fancybox-opacity",i+"")}})),s.on("Panzoom.touchEnd",((t,e,i)=>{var n;const s=this.getSlide();if(s&&S(s.el))return;if(e.isMobile&&document.activeElement&&-1!==["TEXTAREA","INPUT"].indexOf(null===(n=document.activeElement)||void 0===n?void 0:n.nodeName))return;const o=Math.abs(e.dragOffset.y);"y"===e.lockedAxis&&(o>=200||o>=50&&e.dragOffset.time<300)&&(i&&i.cancelable&&i.preventDefault(),this.close(i,"f-throwOut"+(e.current.f<0?"Up":"Down")))}))),s.on(["change"],(t=>{var e;let i=null===(e=this.getSlide())||void 0===e?void 0:e.triggerEl;if(i){const e=new CustomEvent("slideTo",{bubbles:!0,cancelable:!0,detail:t.page});i.dispatchEvent(e)}})),s.on(["refresh","change"],(t=>{const e=this.container;if(!e)return;for(const i of e.querySelectorAll("[data-fancybox-current-index]"))i.innerHTML=t.page+1;for(const i of e.querySelectorAll("[data-fancybox-count]"))i.innerHTML=t.pages.length;if(!t.isInfinite){for(const i of e.querySelectorAll("[data-fancybox-next]"))t.page<t.pages.length-1?(i.removeAttribute("disabled"),i.removeAttribute("tabindex")):(i.setAttribute("disabled",""),i.setAttribute("tabindex","-1"));for(const i of e.querySelectorAll("[data-fancybox-prev]"))t.page>0?(i.removeAttribute("disabled"),i.removeAttribute("tabindex")):(i.setAttribute("disabled",""),i.setAttribute("tabindex","-1"))}const i=this.getSlide();if(!i)return;let n=i.downloadSrc||"";n||"image"!==i.type||i.error||"string"!=typeof i.src||(n=i.src);for(const t of e.querySelectorAll("[data-fancybox-download]")){const e=i.downloadFilename;n?(t.removeAttribute("disabled"),t.removeAttribute("tabindex"),t.setAttribute("href",n),t.setAttribute("download",e||n),t.setAttribute("target","_blank")):(t.setAttribute("disabled",""),t.setAttribute("tabindex","-1"),t.removeAttribute("href"),t.removeAttribute("download"))}})),this.emit("initCarousel")}attachEvents(){const t=this.container;t&&(t.addEventListener("click",this.onClick,{passive:!1,capture:!1}),t.addEventListener("wheel",this.onWheel,{passive:!1,capture:!1}),document.addEventListener("keydown",this.onKeydown,{passive:!1,capture:!0}),document.addEventListener("visibilitychange",this.onVisibilityChange,!1),document.addEventListener("mousemove",this.onMousemove),this.option("trapFocus")&&document.addEventListener("focus",this.onFocus,!0),window.addEventListener("resize",this.onResize))}detachEvents(){const t=this.container;t&&(document.removeEventListener("keydown",this.onKeydown,{passive:!1,capture:!0}),t.removeEventListener("wheel",this.onWheel,{passive:!1,capture:!1}),t.removeEventListener("click",this.onClick,{passive:!1,capture:!1}),document.removeEventListener("mousemove",this.onMousemove),window.removeEventListener("resize",this.onResize),document.removeEventListener("visibilitychange",this.onVisibilityChange,!1),document.removeEventListener("focus",this.onFocus,!0))}onClick(t){var e,i;if(this.isClosing())return;!this.isCompact&&this.option("idle")&&this.resetIdle();const n=t.composedPath()[0];if(n===(null===(e=this.carousel)||void 0===e?void 0:e.container))return;if(n.closest(".f-spinner")||n.closest("[data-fancybox-close]"))return t.preventDefault(),void this.close(t);if(n.closest("[data-fancybox-prev]"))return t.preventDefault(),void this.prev();if(n.closest("[data-fancybox-next]"))return t.preventDefault(),void this.next();if(this.isCompact&&"image"===(null===(i=this.getSlide())||void 0===i?void 0:i.type))return void(this.clickTimer?(clearTimeout(this.clickTimer),this.clickTimer=null):this.clickTimer=setTimeout((()=>{this.toggleIdle(),this.clickTimer=null}),350));if(this.emit("click",t),t.defaultPrevented)return;let s=!1;const o=document.activeElement;if(n.closest(".fancybox__content")){if(o){if(o.closest("[contenteditable]"))return;n.matches(l)||o.blur()}if((a=window.getSelection())&&"Range"===a.type)return;s=this.option("contentClick")}else n.closest(".fancybox__carousel")&&!n.matches(l)&&(s=this.option("backdropClick"));var a;"close"===s?(t.preventDefault(),this.close(t)):"next"===s?(t.preventDefault(),this.next()):"prev"===s&&(t.preventDefault(),this.prev())}onWheel(t){const e=this.option("wheel",t),i="slide"===e,n=[-t.deltaX||0,-t.deltaY||0,-t.detail||0].reduce((function(t,e){return Math.abs(e)>Math.abs(t)?e:t})),s=Math.max(-1,Math.min(1,n)),o=Date.now();this.pwt&&o-this.pwt<300?i&&t.preventDefault():(this.pwt=o,this.emit("wheel",t),t.defaultPrevented||("close"===e?(t.preventDefault(),this.close(t)):"slide"===e&&(t.preventDefault(),this[s>0?"prev":"next"]())))}onKeydown(t){if(!this.isTopmost())return;this.isCompact||!this.option("idle")||this.isClosing()||this.resetIdle();const e=t.key,i=this.option("keyboard");if(!i||t.ctrlKey||t.altKey||t.shiftKey)return;const n=t.composedPath()[0],o=document.activeElement&&document.activeElement.classList,a=o&&o.contains("f-button")||n.dataset.carouselPage||n.dataset.carouselIndex;if("Escape"!==e&&!a&&s(n)){if(n.isContentEditable||-1!==["TEXTAREA","OPTION","INPUT","SELECT","VIDEO"].indexOf(n.nodeName))return}this.emit("keydown",e,t);const r=i[e];"function"==typeof this[r]&&(t.preventDefault(),this[r]())}onResize(){const t=this.container;if(!t)return;const e=this.isCompact;t.classList.toggle("is-compact",e),this.manageCaption(this.getSlide()),this.isCompact?this.clearIdle():this.endIdle(),this.emit("resize")}onFocus(t){this.isTopmost()&&this.checkFocus(t)}onMousemove(t){this.prevMouseMoveEvent=t,!this.isCompact&&this.option("idle")&&this.resetIdle()}onVisibilityChange(){"visible"===document.visibilityState?this.checkFocus():this.endIdle()}manageCloseBtn(t){const e=this.optionFor(t,"closeButton")||!1;if("auto"===e){const t=this.plugins.Toolbar;if(t&&t.state===at.Ready)return}if(!e)return;if(!t.contentEl||t.closeBtnEl)return;const i=this.option("tpl.closeButton");if(i){const e=n(this.localize(i));t.closeBtnEl=t.contentEl.appendChild(e),t.el&&F(t.el,"has-close-btn")}}manageCaption(t){var e,i;const n="fancybox__caption",s="has-caption",o=this.container;if(!o)return;const a=this.isCompact||this.option("commonCaption"),r=!a;if(this.caption&&this.stop(this.caption),r&&this.caption&&(this.caption.remove(),this.caption=null),a&&!this.caption)for(const t of(null===(e=this.carousel)||void 0===e?void 0:e.slides)||[])t.captionEl&&(t.captionEl.remove(),t.captionEl=void 0,D(t.el,s),null===(i=t.el)||void 0===i||i.removeAttribute("aria-labelledby"));if(t||(t=this.getSlide()),!t||a&&!this.isCurrentSlide(t))return;const l=t.el;let c=this.optionFor(t,"caption","");if("string"!=typeof c||!c.length)return void(a&&this.caption&&this.animate(this.caption,"f-fadeOut",(()=>{var t;null===(t=this.caption)||void 0===t||t.remove(),this.caption=null})));let h=null;if(r){if(h=t.captionEl||null,l&&!h){const e=`fancybox__caption_${this.id}_${t.index}`;h=document.createElement("div"),F(h,n),h.setAttribute("id",e),t.captionEl=l.appendChild(h),F(l,s),l.setAttribute("aria-labelledby",e)}}else{if(h=this.caption,h||(h=o.querySelector("."+n)),!h){h=document.createElement("div"),h.dataset.fancyboxCaption="",F(h,n),h.innerHTML=c;(this.footer||o).prepend(h)}F(o,s),this.caption=h}h&&(h.innerHTML=c)}checkFocus(t){var e;const i=document.activeElement||null;i&&(null===(e=this.container)||void 0===e?void 0:e.contains(i))||this.focus(t)}focus(t){var e;if(this.ignoreFocusChange)return;const i=document.activeElement||null,n=(null==t?void 0:t.target)||null,s=this.container,o=this.getSlide();if(!s||!(null===(e=this.carousel)||void 0===e?void 0:e.viewport))return;if(!t&&i&&s.contains(i))return;const a=o&&o.state===f.Ready?o.el:null;if(!a||a.contains(i)||s===i)return;t&&t.cancelable&&t.preventDefault(),this.ignoreFocusChange=!0;const r=Array.from(s.querySelectorAll(l));let h=[],d=null;for(let t of r){const e=!t.offsetParent||t.closest('[aria-hidden="true"]'),i=a&&a.contains(t),n=!this.carousel.viewport.contains(t);t===s||(i||n)&&!e?(h.push(t),void 0!==t.dataset.origTabindex&&(t.tabIndex=parseFloat(t.dataset.origTabindex)),t.removeAttribute("data-orig-tabindex"),!t.hasAttribute("autoFocus")&&d||(d=t)):(t.dataset.origTabindex=void 0===t.dataset.origTabindex?t.getAttribute("tabindex")||void 0:t.dataset.origTabindex,t.tabIndex=-1)}let u=null;t?(!n||h.indexOf(n)<0)&&(u=d||s,h.length&&(i===Lt?u=h[0]:this.lastFocus!==s&&i!==zt||(u=h[h.length-1]))):u=o&&"image"===o.type?s:d||s,u&&c(u),this.lastFocus=document.activeElement,this.ignoreFocusChange=!1}next(){const t=this.carousel;t&&t.pages.length>1&&t.slideNext()}prev(){const t=this.carousel;t&&t.pages.length>1&&t.slidePrev()}jumpTo(...t){this.carousel&&this.carousel.slideTo(...t)}isTopmost(){var t;return(null===(t=It.getInstance())||void 0===t?void 0:t.id)==this.id}animate(t=null,e="",i){if(!t||!e)return void(i&&i());this.stop(t);const n=s=>{s.target===t&&t.dataset.animationName&&(t.removeEventListener("animationend",n),delete t.dataset.animationName,i&&i(),D(t,e))};t.dataset.animationName=e,t.addEventListener("animationend",n),F(t,e)}stop(t){t&&t.dispatchEvent(new CustomEvent("animationend",{bubbles:!1,cancelable:!0,currentTarget:t}))}setContent(t,e="",i=!0){if(this.isClosing())return;const o=t.el;if(!o)return;let a=null;s(e)?["img","picture","iframe","video","audio"].includes(e.nodeName.toLowerCase())?(a=document.createElement("div"),a.appendChild(e)):a=e:"string"==typeof e&&(a=n(e),s(a)||(a=document.createElement("div"),a.innerHTML=e)),a instanceof Element&&t.filter&&!t.error&&(a=a.querySelector(t.filter)),a instanceof Element?(F(a,"fancybox__content"),t.id&&a.setAttribute("id",t.id),"none"!==a.style.display&&"none"!==getComputedStyle(a).getPropertyValue("display")||(a.style.display=t.display||this.option("defaultDisplay")||"flex"),o.classList.add(`has-${t.error?"error":t.type||"unknown"}`),o.prepend(a),t.contentEl=a,i&&this.revealContent(t),this.manageCloseBtn(t),this.manageCaption(t)):this.setError(t,"{{ELEMENT_NOT_FOUND}}")}revealContent(t,e){const i=t.el,n=t.contentEl;i&&n&&(this.emit("reveal",t),this.hideLoading(t),t.state=f.Opening,(e=this.isOpeningSlide(t)?void 0===e?this.optionFor(t,"showClass"):e:"f-fadeIn")?this.animate(n,e,(()=>{this.done(t)})):this.done(t))}done(t){this.isClosing()||(t.state=f.Ready,this.emit("done",t),F(t.el,"is-done"),this.isCurrentSlide(t)&&this.option("autoFocus")&&queueMicrotask((()=>{this.option("autoFocus")&&(this.option("autoFocus")?this.focus():this.checkFocus())})),this.isOpeningSlide(t)&&!this.isCompact&&this.option("idle")&&this.setIdle())}isCurrentSlide(t){const e=this.getSlide();return!(!t||!e)&&e.index===t.index}isOpeningSlide(t){var e,i;return null===(null===(e=this.carousel)||void 0===e?void 0:e.prevPage)&&t.index===(null===(i=this.getSlide())||void 0===i?void 0:i.index)}showLoading(t){t.state=f.Loading;const e=t.el;if(!e)return;F(e,At),this.emit("loading",t),t.spinnerEl||setTimeout((()=>{if(!this.isClosing()&&!t.spinnerEl&&t.state===f.Loading){let i=n(h);t.spinnerEl=i,e.prepend(i),this.animate(i,"f-fadeIn")}}),250)}hideLoading(t){const e=t.el;if(!e)return;const i=t.spinnerEl;this.isClosing()?null==i||i.remove():(D(e,At),i&&this.animate(i,"f-fadeOut",(()=>{i.remove()})),t.state===f.Loading&&(this.emit("loaded",t),t.state=f.Ready))}setError(t,e){if(this.isClosing())return;this.emit("error"),t.error=e,this.hideLoading(t),this.clearContent(t);const i=document.createElement("div");i.classList.add("fancybox-error"),i.innerHTML=this.localize(e||"<p>{{ERROR}}</p>"),this.setContent(t,i)}clearContent(t){var e;null===(e=this.carousel)||void 0===e||e.emit("removeSlide",t),t.contentEl&&(t.contentEl.remove(),t.contentEl=void 0),t.closeBtnEl&&(t.closeBtnEl.remove(),t.closeBtnEl=void 0);const i=t.el;i&&(D(i,At),D(i,"has-error"),D(i,"has-unknown"),D(i,`has-${t.type||"unknown"}`))}getSlide(){var t;const e=this.carousel;return(null===(t=null==e?void 0:e.pages[null==e?void 0:e.page])||void 0===t?void 0:t.slides[0])||void 0}close(t,e){if(this.isClosing())return;const i=new Event("shouldClose",{bubbles:!0,cancelable:!0});if(this.emit("shouldClose",i,t),i.defaultPrevented)return;t&&t.cancelable&&(t.preventDefault(),t.stopPropagation());const n=this.fsAPI,s=()=>{this.proceedClose(t,e)};n&&n.isFullscreen()?Promise.resolve(n.exit()).then((()=>s())):s()}clearIdle(){this.idleTimer&&clearTimeout(this.idleTimer),this.idleTimer=null}setIdle(t=!1){const e=()=>{this.clearIdle(),this.idle=!0,F(this.container,"is-idle"),this.emit("setIdle")};if(this.clearIdle(),!this.isClosing())if(t)e();else{const t=this.option("idle");t&&(this.idleTimer=setTimeout(e,t))}}endIdle(){this.clearIdle(),this.idle&&!this.isClosing()&&(this.idle=!1,D(this.container,"is-idle"),this.emit("endIdle"))}resetIdle(){this.endIdle(),this.setIdle()}toggleIdle(){this.idle?this.endIdle():this.setIdle(!0)}toggleFullscreen(){const t=this.fsAPI;t&&(t.isFullscreen()?t.exit():this.container&&t.request(this.container))}isClosing(){return[p.Closing,p.CustomClosing,p.Destroy].includes(this.state)}proceedClose(t,e){var i;this.state=p.Closing,this.clearIdle(),this.detachEvents();const n=this.container,s=this.carousel,a=this.getSlide(),r=a&&this.option("placeFocusBack")?a.triggerEl||this.option("trigger"):null;if(r&&(o(r)?c(r):r.focus()),n&&(F(n,"is-closing"),n.setAttribute("aria-hidden","true"),this.option("animated")&&F(n,Tt),n.style.pointerEvents="none"),s){s.clearTransitions(),null===(i=s.panzoom)||void 0===i||i.destroy();for(const t of s.slides){t.state=f.Closing,this.hideLoading(t);const e=t.contentEl;e&&this.stop(e);const i=null==t?void 0:t.panzoom;i&&(i.stop(),i.detachEvents(),i.detachObserver()),this.isCurrentSlide(t)||s.emit("removeSlide",t)}}this.emit("close",t),this.state!==p.CustomClosing?(void 0===e&&a&&(e=this.optionFor(a,"hideClass")),e&&a?(this.animate(a.contentEl,e,(()=>{s&&s.emit("removeSlide",a)})),setTimeout((()=>{this.destroy()}),500)):this.destroy()):setTimeout((()=>{this.destroy()}),500)}destroy(){var t;if(this.state===p.Destroy)return;this.state=p.Destroy,null===(t=this.carousel)||void 0===t||t.destroy();const e=this.container;e&&e.remove(),Rt.delete(this.id);const i=It.getInstance();i?i.focus():(zt&&(zt.remove(),zt=null),Lt&&(Lt.remove(),Lt=null),D(document.documentElement,St),(()=>{if(!a)return;const t=document,e=t.body;e.classList.remove(Pt),e.style.setProperty(Mt,""),t.documentElement.style.setProperty(Ct,"")})(),this.emit("destroy"))}static bind(t,e,i){if(!a)return;let n,o="",r={};if(void 0===t?n=document.body:"string"==typeof t?(n=document.body,o=t,"object"==typeof e&&(r=e||{})):(n=t,"string"==typeof e&&(o=e),"object"==typeof i&&(r=i||{})),!n||!s(n))return;o=o||"[data-fancybox]";const l=It.openers.get(n)||new Map;l.set(o,r),It.openers.set(n,l),1===l.size&&n.addEventListener("click",It.fromEvent)}static unbind(t,e){let i,n="";if("string"==typeof t?(i=document.body,n=t):(i=t,"string"==typeof e&&(n=e)),!i)return;const s=It.openers.get(i);s&&n&&s.delete(n),n&&s||(It.openers.delete(i),i.removeEventListener("click",It.fromEvent))}static destroy(){let t;for(;t=It.getInstance();)t.destroy();for(const t of It.openers.keys())t.removeEventListener("click",It.fromEvent);It.openers=new Map}static fromEvent(t){if(t.defaultPrevented)return;if(t.button&&0!==t.button)return;if(t.ctrlKey||t.metaKey||t.shiftKey)return;let e=t.composedPath()[0];const n=e.closest("[data-fancybox-trigger]");if(n){const t=n.dataset.fancyboxTrigger||"",i=document.querySelectorAll(`[data-fancybox="${t}"]`),s=parseInt(n.dataset.fancyboxIndex||"",10)||0;e=i[s]||e}if(!(e&&e instanceof Element))return;let s,o,a,r;if([...It.openers].reverse().find((([t,i])=>!(!t.contains(e)||![...i].reverse().find((([i,n])=>{let l=e.closest(i);return!!l&&(s=t,o=i,a=l,r=n,!0)}))))),!s||!o||!a)return;r=r||{},t.preventDefault(),e=a;let l=[],c=i({},u,r);c.event=t,c.trigger=e,c.delegate=n;const h=c.groupAll,d=c.groupAttr,p=d&&e?e.getAttribute(`${d}`):"";if((!e||p||h)&&(l=[].slice.call(s.querySelectorAll(o))),e&&!h&&(l=p?l.filter((t=>t.getAttribute(`${d}`)===p)):[e]),!l.length)return;const f=It.getInstance();return f&&f.options.trigger&&l.indexOf(f.options.trigger)>-1?void 0:(e&&(c.startIndex=l.indexOf(e)),It.fromNodes(l,c))}static fromNodes(t,e){e=i({},u,e);const n=[];for(const i of t){const t=i.dataset||{},s=t.src||i.getAttribute("href")||i.getAttribute("currentSrc")||i.getAttribute("src")||void 0;let o;const a=e.delegate;let r;a&&n.length===e.startIndex&&(o=a instanceof HTMLImageElement?a:a.querySelector("img:not([aria-hidden])")),o||(o=i instanceof HTMLImageElement?i:i.querySelector("img:not([aria-hidden])")),o&&(r=o.currentSrc||o.src||void 0,!r&&o.dataset&&(r=o.dataset.lazySrc||o.dataset.src||void 0));const l={src:s,triggerEl:i,thumbEl:o,thumbElSrc:r,thumbSrc:r};for(const e in t)"fancybox"!==e&&(l[e]=t[e]+"");n.push(l)}return new It(n,e)}static getInstance(t){if(t)return Rt.get(t);return Array.from(Rt.values()).reverse().find((t=>!t.isClosing()&&t))||null}static getSlide(){var t;return(null===(t=It.getInstance())||void 0===t?void 0:t.getSlide())||null}static show(t=[],e={}){return new It(t,e)}static next(){const t=It.getInstance();t&&t.next()}static prev(){const t=It.getInstance();t&&t.prev()}static close(t=!0,...e){if(t)for(const t of Rt.values())t.close(...e);else{const t=It.getInstance();t&&t.close(...e)}}}Object.defineProperty(It,"version",{enumerable:!0,configurable:!0,writable:!0,value:"5.0.14"}),Object.defineProperty(It,"defaults",{enumerable:!0,configurable:!0,writable:!0,value:u}),Object.defineProperty(It,"Plugins",{enumerable:!0,configurable:!0,writable:!0,value:ht}),Object.defineProperty(It,"openers",{enumerable:!0,configurable:!0,writable:!0,value:new Map}),t.Fancybox=It}));

var LazyLoad=function(){"use strict";function t(){return(t=Object.assign||function(t){for(var n=1;n<arguments.length;n++){var e=arguments[n];for(var i in e)Object.prototype.hasOwnProperty.call(e,i)&&(t[i]=e[i])}return t}).apply(this,arguments)}var n="undefined"!=typeof window,e=n&&!("onscroll"in window)||"undefined"!=typeof navigator&&/(gle|ing|ro)bot|crawl|spider/i.test(navigator.userAgent),i=n&&"IntersectionObserver"in window,r=n&&"classList"in document.createElement("p"),a=n&&window.devicePixelRatio>1,o={elements_selector:".lazy",container:e||n?document:null,threshold:300,thresholds:null,data_src:"src",data_srcset:"srcset",data_sizes:"sizes",data_bg:"bg",data_bg_hidpi:"bg-hidpi",data_bg_multi:"bg-multi",data_bg_multi_hidpi:"bg-multi-hidpi",data_poster:"poster",class_applied:"applied",class_loading:"loading",class_loaded:"loaded",class_error:"error",class_entered:"entered",class_exited:"exited",unobserve_completed:!0,unobserve_entered:!1,cancel_on_exit:!0,callback_enter:null,callback_exit:null,callback_applied:null,callback_loading:null,callback_loaded:null,callback_error:null,callback_finish:null,callback_cancel:null,use_native:!1},c=function(n){return t({},o,n)},s=function(t,n){var e,i="LazyLoad::Initialized",r=new t(n);try{e=new CustomEvent(i,{detail:{instance:r}})}catch(t){(e=document.createEvent("CustomEvent")).initCustomEvent(i,!1,!1,{instance:r})}window.dispatchEvent(e)},l="loading",u="loaded",d="applied",f="error",_="native",g="data-",v="ll-status",b=function(t,n){return t.getAttribute(g+n)},p=function(t){return b(t,v)},h=function(t,n){return function(t,n,e){var i="data-ll-status";null!==e?t.setAttribute(i,e):t.removeAttribute(i)}(t,0,n)},m=function(t){return h(t,null)},E=function(t){return null===p(t)},A=function(t){return p(t)===_},I=[l,u,d,f],L=function(t,n,e,i){t&&(void 0===i?void 0===e?t(n):t(n,e):t(n,e,i))},w=function(t,n){r?t.classList.add(n):t.className+=(t.className?" ":"")+n},y=function(t,n){r?t.classList.remove(n):t.className=t.className.replace(new RegExp("(^|\\s+)"+n+"(\\s+|$)")," ").replace(/^\s+/,"").replace(/\s+$/,"")},k=function(t){return t.llTempImage},O=function(t,n){if(n){var e=n._observer;e&&e.unobserve(t)}},z=function(t,n){t&&(t.loadingCount+=n)},x=function(t,n){t&&(t.toLoadCount=n)},C=function(t){for(var n,e=[],i=0;n=t.children[i];i+=1)"SOURCE"===n.tagName&&e.push(n);return e},N=function(t,n,e){e&&t.setAttribute(n,e)},M=function(t,n){t.removeAttribute(n)},R=function(t){return!!t.llOriginalAttrs},G=function(t){if(!R(t)){var n={};n.src=t.getAttribute("src"),n.srcset=t.getAttribute("srcset"),n.sizes=t.getAttribute("sizes"),t.llOriginalAttrs=n}},T=function(t){if(R(t)){var n=t.llOriginalAttrs;N(t,"src",n.src),N(t,"srcset",n.srcset),N(t,"sizes",n.sizes)}},D=function(t,n){N(t,"sizes",b(t,n.data_sizes)),N(t,"srcset",b(t,n.data_srcset)),N(t,"src",b(t,n.data_src))},F=function(t){M(t,"src"),M(t,"srcset"),M(t,"sizes")},P=function(t,n){var e=t.parentNode;e&&"PICTURE"===e.tagName&&C(e).forEach(n)},S={IMG:function(t,n){P(t,(function(t){G(t),D(t,n)})),G(t),D(t,n)},IFRAME:function(t,n){N(t,"src",b(t,n.data_src))},VIDEO:function(t,n){!function(t,e){C(t).forEach((function(t){N(t,"src",b(t,n.data_src))}))}(t),N(t,"poster",b(t,n.data_poster)),N(t,"src",b(t,n.data_src)),t.load()}},V=function(t,n){var e=S[t.tagName];e&&e(t,n)},j=function(t,n,e){z(e,1),w(t,n.class_loading),h(t,l),L(n.callback_loading,t,e)},U=["IMG","IFRAME","VIDEO"],$=function(t,n){!n||function(t){return t.loadingCount>0}(n)||function(t){return t.toLoadCount>0}(n)||L(t.callback_finish,n)},q=function(t,n,e){t.addEventListener(n,e),t.llEvLisnrs[n]=e},H=function(t,n,e){t.removeEventListener(n,e)},B=function(t){return!!t.llEvLisnrs},J=function(t){if(B(t)){var n=t.llEvLisnrs;for(var e in n){var i=n[e];H(t,e,i)}delete t.llEvLisnrs}},K=function(t,n,e){!function(t){delete t.llTempImage}(t),z(e,-1),function(t){t&&(t.toLoadCount-=1)}(e),y(t,n.class_loading),n.unobserve_completed&&O(t,e)},Q=function(t,n,e){var i=k(t)||t;B(i)||function(t,n,e){B(t)||(t.llEvLisnrs={});var i="VIDEO"===t.tagName?"loadeddata":"load";q(t,i,n),q(t,"error",e)}(i,(function(r){!function(t,n,e,i){var r=A(n);K(n,e,i),w(n,e.class_loaded),h(n,u),L(e.callback_loaded,n,i),r||$(e,i)}(0,t,n,e),J(i)}),(function(r){!function(t,n,e,i){var r=A(n);K(n,e,i),w(n,e.class_error),h(n,f),L(e.callback_error,n,i),r||$(e,i)}(0,t,n,e),J(i)}))},W=function(t,n,e){!function(t){t.llTempImage=document.createElement("IMG")}(t),Q(t,n,e),function(t,n,e){var i=b(t,n.data_bg),r=b(t,n.data_bg_hidpi),o=a&&r?r:i;o&&(t.style.backgroundImage='url("'.concat(o,'")'),k(t).setAttribute("src",o),j(t,n,e))}(t,n,e),function(t,n,e){var i=b(t,n.data_bg_multi),r=b(t,n.data_bg_multi_hidpi),o=a&&r?r:i;o&&(t.style.backgroundImage=o,function(t,n,e){w(t,n.class_applied),h(t,d),n.unobserve_completed&&O(t,n),L(n.callback_applied,t,e)}(t,n,e))}(t,n,e)},X=function(t,n,e){!function(t){return U.indexOf(t.tagName)>-1}(t)?W(t,n,e):function(t,n,e){Q(t,n,e),V(t,n),j(t,n,e)}(t,n,e)},Y=["IMG","IFRAME"],Z=function(t){return t.use_native&&"loading"in HTMLImageElement.prototype},tt=function(t,n,e){t.forEach((function(t){return function(t){return t.isIntersecting||t.intersectionRatio>0}(t)?function(t,n,e,i){h(t,"entered"),w(t,e.class_entered),y(t,e.class_exited),function(t,n,e){n.unobserve_entered&&O(t,e)}(t,e,i),L(e.callback_enter,t,n,i),function(t){return I.indexOf(p(t))>=0}(t)||X(t,e,i)}(t.target,t,n,e):function(t,n,e,i){E(t)||(w(t,e.class_exited),function(t,n,e,i){e.cancel_on_exit&&function(t){return p(t)===l}(t)&&"IMG"===t.tagName&&(J(t),function(t){P(t,(function(t){F(t)})),F(t)}(t),function(t){P(t,(function(t){T(t)})),T(t)}(t),y(t,e.class_loading),z(i,-1),m(t),L(e.callback_cancel,t,n,i))}(t,n,e,i),L(e.callback_exit,t,n,i))}(t.target,t,n,e)}))},nt=function(t){return Array.prototype.slice.call(t)},et=function(t){return t.container.querySelectorAll(t.elements_selector)},it=function(t){return function(t){return p(t)===f}(t)},rt=function(t,n){return function(t){return nt(t).filter(E)}(t||et(n))},at=function(t,e){var r=c(t);this._settings=r,this.loadingCount=0,function(t,n){i&&!Z(t)&&(n._observer=new IntersectionObserver((function(e){tt(e,t,n)}),function(t){return{root:t.container===document?null:t.container,rootMargin:t.thresholds||t.threshold+"px"}}(t)))}(r,this),function(t,e){n&&window.addEventListener("online",(function(){!function(t,n){var e;(e=et(t),nt(e).filter(it)).forEach((function(n){y(n,t.class_error),m(n)})),n.update()}(t,e)}))}(r,this),this.update(e)};return at.prototype={update:function(t){var n,r,a=this._settings,o=rt(t,a);x(this,o.length),!e&&i?Z(a)?function(t,n,e){t.forEach((function(t){-1!==Y.indexOf(t.tagName)&&(t.setAttribute("loading","lazy"),function(t,n,e){Q(t,n,e),V(t,n),h(t,_)}(t,n,e))})),x(e,0)}(o,a,this):(r=o,function(t){t.disconnect()}(n=this._observer),function(t,n){n.forEach((function(n){t.observe(n)}))}(n,r)):this.loadAll(o)},destroy:function(){this._observer&&this._observer.disconnect(),et(this._settings).forEach((function(t){delete t.llOriginalAttrs})),delete this._observer,delete this._settings,delete this.loadingCount,delete this.toLoadCount},loadAll:function(t){var n=this,e=this._settings;rt(t,e).forEach((function(t){O(t,n),X(t,e,n)}))}},at.load=function(t,n){var e=c(n);X(t,e)},at.resetStatus=function(t){m(t)},n&&function(t,n){if(n)if(n.length)for(var e,i=0;e=n[i];i+=1)s(t,e);else s(t,n)}(at,window.lazyLoadOptions),at}();


/*!
 * Snackbar v0.1.14
 * http://polonel.com/Snackbar
 *
 * Copyright 2018 Chris Brame and other contributors
 * Released under the MIT license
 * https://github.com/polonel/Snackbar/blob/master/LICENSE
 */
!function(a,b){"use strict";"function"==typeof define&&define.amd?define([],function(){return a.Snackbar=b()}):"object"==typeof module&&module.exports?module.exports=a.Snackbar=b():a.Snackbar=b()}(this,function(){var a={};a.current=null;var b={text:"Default Text",textColor:"#FFFFFF",width:"auto",showAction:!0,actionText:"Dismiss",actionTextAria:"Dismiss, Description for Screen Readers",alertScreenReader:!1,actionTextColor:"#4CAF50",showSecondButton:!1,secondButtonText:"",secondButtonAria:"Description for Screen Readers",secondButtonTextColor:"#4CAF50",backgroundColor:"#323232",pos:"bottom-left",duration:5e3,customClass:"",onActionClick:function(a){a.style.opacity=0},onSecondButtonClick:function(a){},onClose:function(a){}};a.show=function(d){var e=c(!0,b,d);a.current&&(a.current.style.opacity=0,setTimeout(function(){var a=this.parentElement;a&&
// possible null if too many/fast Snackbars
a.removeChild(this)}.bind(a.current),500)),a.snackbar=document.createElement("div"),a.snackbar.className="snackbar-container "+e.customClass,a.snackbar.style.width=e.width;var f=document.createElement("p");if(f.style.margin=0,f.style.padding=0,f.style.color=e.textColor,f.style.fontSize="14px",f.style.fontWeight=300,f.style.lineHeight="1em",f.innerHTML=e.text,a.snackbar.appendChild(f),a.snackbar.style.background=e.backgroundColor,e.showSecondButton){var g=document.createElement("button");g.className="action",g.innerHTML=e.secondButtonText,g.setAttribute("aria-label",e.secondButtonAria),g.style.color=e.secondButtonTextColor,g.addEventListener("click",function(){e.onSecondButtonClick(a.snackbar)}),a.snackbar.appendChild(g)}if(e.showAction){var h=document.createElement("button");h.className="action",h.innerHTML=e.actionText,h.setAttribute("aria-label",e.actionTextAria),h.style.color=e.actionTextColor,h.addEventListener("click",function(){e.onActionClick(a.snackbar)}),a.snackbar.appendChild(h)}e.duration&&setTimeout(function(){a.current===this&&(a.current.style.opacity=0,
// When natural remove event occurs let's move the snackbar to its origins
a.current.style.top="-100px",a.current.style.bottom="-100px")}.bind(a.snackbar),e.duration),e.alertScreenReader&&a.snackbar.setAttribute("role","alert"),a.snackbar.addEventListener("transitionend",function(b,c){"opacity"===b.propertyName&&"0"===this.style.opacity&&("function"==typeof e.onClose&&e.onClose(this),this.parentElement.removeChild(this),a.current===this&&(a.current=null))}.bind(a.snackbar)),a.current=a.snackbar,document.body.appendChild(a.snackbar);getComputedStyle(a.snackbar).bottom,getComputedStyle(a.snackbar).top;a.snackbar.style.opacity=1,a.snackbar.className="snackbar-container "+e.customClass+" snackbar-pos "+e.pos},a.close=function(){a.current&&(a.current.style.opacity=0)};
// Pure JS Extend
// http://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
var c=function(){var a={},b=!1,d=0,e=arguments.length;"[object Boolean]"===Object.prototype.toString.call(arguments[0])&&(b=arguments[0],d++);for(var f=function(d){for(var e in d)Object.prototype.hasOwnProperty.call(d,e)&&(b&&"[object Object]"===Object.prototype.toString.call(d[e])?a[e]=c(!0,a[e],d[e]):a[e]=d[e])};d<e;d++){var g=arguments[d];f(g)}return a};return a});
//# sourceMappingURL=snackbar.min.js.map


console.log(anzhiyu)
var $web_container = document.getElementById("web_container");
var $web_box = document.getElementById("web_box");
var $bodyWrap = document.getElementById("body-wrap");
var $main = document.querySelector("main");
var dragStartX;


document.addEventListener("DOMContentLoaded", function () {
  function onDragStart(event) {
    // event.preventDefault();
    dragStartX = getEventX(event);
    $web_box.style.transition = "all .3s";
    addMoveEndListeners(onDragMove, onDragEnd);
  }

  function onDragMove(event) {
    
    const deltaX = getEventX(event) - dragStartX;
    if (deltaX < 0) {
      const screenWidth = window.innerWidth;
      const translateX = Math.min(-300, ((-1 * deltaX) / screenWidth) * 300);
      const scale = Math.min(1, 0.86 + (deltaX / screenWidth) * (1 - 0.86));
      $web_box.style.transform = `translate3d(-${translateX}px, 0px, 0px) scale3d(${scale}, ${scale}, 1)`;
    }
  }

  function onDragEnd(event) {
    const screenWidth = window.innerWidth;
    if (getEventX(event) <= screenWidth / 1.5) {
      completeTransition();
    } else {
      resetTransition();
    }
    removeMoveEndListeners(onDragMove, onDragEnd);
  }

  function completeTransition() {
    $web_box.style.transition = "all 0.3s ease-out";
    $web_box.style.transform = "none";
    sidebarFn.close();
    removeMoveEndListeners(onDragMove, onDragEnd);
  }

  function resetTransition() {
    $web_box.style.transition = "";
    $web_box.style.transform = "";
  }

  function getEventX(event) {
    return event.type.startsWith("touch") ? event.changedTouches[0].clientX : event.clientX;
  }

  function addMoveEndListeners(moveHandler, endHandler) {
    document.addEventListener("mousemove", moveHandler);
    document.addEventListener("mouseup", endHandler);
    document.addEventListener("touchmove", moveHandler, { passive: false });
    document.addEventListener("touchend", endHandler);
  }

  function removeMoveEndListeners(moveHandler, endHandler) {
    document.removeEventListener("mousemove", moveHandler);
    document.removeEventListener("mouseup", endHandler);
    document.removeEventListener("touchmove", moveHandler);
    document.removeEventListener("touchend", endHandler);
  }

  let blogNameWidth, menusWidth, searchWidth;
  let mobileSidebarOpen = false;
  const $sidebarMenus = document.getElementById("sidebar-menus");
  const $rightside = document.getElementById("rightside");
  let $nav = document.getElementById("nav");
  const adjustMenu = init => {
    if (init) {
      blogNameWidth = document.getElementById("site-name").offsetWidth;
      const $menusEle = document.querySelectorAll("#menus .menus_item");
      menusWidth = 0;
      $menusEle.length &&
        $menusEle.forEach(i => {
          menusWidth += i.offsetWidth;
        });
      const $searchEle = document.querySelector("#search-button");
      searchWidth = $searchEle ? $searchEle.offsetWidth : 0;
      $nav = document.getElementById("nav");
    }

    let hideMenuIndex = "";
    if (window.innerWidth <= 768) hideMenuIndex = true;
    else hideMenuIndex = blogNameWidth + menusWidth + searchWidth > $nav.offsetWidth - 120;

    if (hideMenuIndex) {
      $nav.classList.add("hide-menu");
    } else {
      $nav.classList.remove("hide-menu");
    }
  };

  // 初始化header
  const initAdjust = () => {
    adjustMenu(true);
    $nav.classList.add("show");
  };

  // sidebar menus
  const sidebarFn = {
    open: () => {
      anzhiyu.sidebarPaddingR();
      anzhiyu.changeThemeMetaColor("#607d8b");
      anzhiyu.animateIn(document.getElementById("menu-mask"), "to_show 0.5s");
      $sidebarMenus.classList.add("open");
      $web_box.classList.add("open");
      $rightside.classList.add("hide");
      $nav.style.borderTopLeftRadius = "12px";
      mobileSidebarOpen = true;
      document.body.style.overflow = "hidden";
      $web_box.addEventListener("mousedown", onDragStart);
      $web_box.addEventListener("touchstart", onDragStart, { passive: false });
      if (window.location.pathname.startsWith("/music/")) {
        $web_container.style.background = "rgb(255 255 255 / 20%)";
      } else {
        $web_container.style.background = "var(--global-bg)";
      }
    },
    close: () => {
      const $body = document.body;
      anzhiyu.initThemeColor();
      $body.style.paddingRight = "";
      anzhiyu.animateOut(document.getElementById("menu-mask"), "to_hide 0.5s");
      $sidebarMenus.classList.remove("open");
      $web_box.classList.remove("open");
      $rightside.classList.remove("hide");
      $nav.style.borderTopLeftRadius = "0px";
      mobileSidebarOpen = false;
      document.body.style.overflow = "auto";
      anzhiyu.addNavBackgroundInit();
    },
  };

  /**
   * 首頁top_img底下的箭頭
   */
  const scrollDownInIndex = () => {
    const $bbTimeList = document.getElementById("bbTimeList");
    const $scrollDownEle = document.getElementById("scroll-down");
    $scrollDownEle &&
      $scrollDownEle.addEventListener("click", function () {
        if ($bbTimeList) {
          anzhiyu.scrollToDest($bbTimeList.offsetTop, 300);
        } else {
          anzhiyu.scrollToDest(document.getElementById("content-inner").offsetTop, 300);
        }
      });
  };

  /**
   * 代码
   * 只适用于Hexo默认的代码渲染
   */
  const addHighlightTool = function () {
    const highLight = GLOBAL_CONFIG.highlight;
    if (!highLight) return;

    const isHighlightCopy = highLight.highlightCopy;
    const isHighlightLang = highLight.highlightLang;
    const isHighlightShrink = GLOBAL_CONFIG_SITE.isHighlightShrink;
    const highlightHeightLimit = highLight.highlightHeightLimit;
    const isShowTool = isHighlightCopy || isHighlightLang || isHighlightShrink !== undefined;
    const $figureHighlight =
      highLight.plugin === "highlighjs"
        ? document.querySelectorAll("figure.highlight")
        : document.querySelectorAll('pre[class*="language-"]');

    if (!((isShowTool || highlightHeightLimit) && $figureHighlight.length)) return;

    const isPrismjs = highLight.plugin === "prismjs";

    let highlightShrinkEle = "";
    let highlightCopyEle = "";
    const highlightShrinkClass = isHighlightShrink === true ? "closed" : "";

    if (isHighlightShrink !== undefined) {
      highlightShrinkEle = `<i class="anzhiyufont anzhiyu-icon-angle-down expand ${highlightShrinkClass}"></i>`;
    }

    if (isHighlightCopy) {
      highlightCopyEle = '<div class="copy-notice"></div><i class="anzhiyufont anzhiyu-icon-paste copy-button"></i>';
    }

    const copy = (text, ctx) => {
      if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        document.execCommand("copy");
        if (GLOBAL_CONFIG.Snackbar !== undefined) {
          anzhiyu.snackbarShow(GLOBAL_CONFIG.copy.success);
        } else {
          const prevEle = ctx.previousElementSibling;
          prevEle.innerText = GLOBAL_CONFIG.copy.success;
          prevEle.style.opacity = 1;
          setTimeout(() => {
            prevEle.style.opacity = 0;
          }, 700);
        }
      } else {
        if (GLOBAL_CONFIG.Snackbar !== undefined) {
          anzhiyu.snackbarShow(GLOBAL_CONFIG.copy.noSupport);
        } else {
          ctx.previousElementSibling.innerText = GLOBAL_CONFIG.copy.noSupport;
        }
      }
    };

    // click events
    const highlightCopyFn = ele => {
      const $buttonParent = ele.parentNode;
      $buttonParent.classList.add("copy-true");
      const selection = window.getSelection();
      const range = document.createRange();
      if (isPrismjs) range.selectNodeContents($buttonParent.querySelectorAll("pre code")[0]);
      else range.selectNodeContents($buttonParent.querySelectorAll("table .code pre")[0]);
      selection.removeAllRanges();
      selection.addRange(range);
      const text = selection.toString();
      copy(text, ele.lastChild);
      selection.removeAllRanges();
      $buttonParent.classList.remove("copy-true");
    };

    const highlightShrinkFn = ele => {
      const $nextEle = [...ele.parentNode.children].slice(1);
      ele.firstChild.classList.toggle("closed");
      if (anzhiyu.isHidden($nextEle[$nextEle.length - 1])) {
        $nextEle.forEach(e => {
          e.style.display = "block";
        });
      } else {
        $nextEle.forEach(e => {
          e.style.display = "none";
        });
      }
    };

    const highlightToolsFn = function (e) {
      const $target = e.target.classList;
      if ($target.contains("expand")) highlightShrinkFn(this);
      else if ($target.contains("copy-button")) highlightCopyFn(this);
    };

    const expandCode = function () {
      this.classList.toggle("expand-done");
    };

    function createEle(lang, item, service) {
      const fragment = document.createDocumentFragment();

      if (isShowTool) {
        const hlTools = document.createElement("div");
        hlTools.className = `highlight-tools ${highlightShrinkClass}`;
        hlTools.innerHTML = highlightShrinkEle + lang + highlightCopyEle;
        hlTools.addEventListener("click", highlightToolsFn);
        fragment.appendChild(hlTools);
      }

      if (highlightHeightLimit && item.offsetHeight > highlightHeightLimit + 30) {
        const ele = document.createElement("div");
        ele.className = "code-expand-btn";
        ele.innerHTML = '<i class="anzhiyufont anzhiyu-icon-angle-double-down"></i>';
        ele.addEventListener("click", expandCode);
        fragment.appendChild(ele);
      }

      if (service === "hl") {
        item.insertBefore(fragment, item.firstChild);
      } else {
        item.parentNode.insertBefore(fragment, item);
      }
    }

    if (isHighlightLang) {
      if (isPrismjs) {
        $figureHighlight.forEach(function (item) {
          const langName = item.getAttribute("data-language") ? item.getAttribute("data-language") : "Code";
          const highlightLangEle = `<div class="code-lang">${langName}</div>`;
          anzhiyu.wrap(item, "figure", { class: "highlight" });
          createEle(highlightLangEle, item);
        });
      } else {
        $figureHighlight.forEach(function (item) {
          let langName = item.getAttribute("class").split(" ")[1];
          if (langName === "plain" || langName === undefined || langName === "plaintext") langName = "Code";
          const highlightLangEle = `<div class="code-lang">${langName}</div>`;
          createEle(highlightLangEle, item, "hl");
        });
      }
    } else {
      if (isPrismjs) {
        $figureHighlight.forEach(function (item) {
          anzhiyu.wrap(item, "figure", { class: "highlight" });
          createEle("", item);
        });
      } else {
        $figureHighlight.forEach(function (item) {
          createEle("", item, "hl");
        });
      }
    }
  };

  /**
   * PhotoFigcaption
   */
  function addPhotoFigcaption() {
    document.querySelectorAll("#article-container img").forEach(function (item) {
      const parentEle = item.parentNode;
      const altValue = item.title || item.alt;
      if (altValue && !parentEle.parentNode.classList.contains("justified-gallery")) {
        const ele = document.createElement("div");
        ele.className = "img-alt is-center";
        ele.textContent = altValue;
        parentEle.insertBefore(ele, item.nextSibling);
      }
    });
  }

  /**
   * Lightbox
   */
  const runLightbox = () => {
    anzhiyu.loadLightbox(document.querySelectorAll("#article-container img:not(.no-lightbox)"));
  };

  /**
   * justified-gallery 圖庫排版
   */
  const runJustifiedGallery = function (ele) {
    const htmlStr = arr => {
      let str = "";
      const replaceDq = str => str.replace(/"/g, "&quot;"); // replace double quotes to &quot;
      arr.forEach(i => {
        const alt = i.alt ? `alt="${replaceDq(i.alt)}"` : "";
        const title = i.title ? `title="${replaceDq(i.title)}"` : "";
        const address = i.address ? i.address : "";
        const galleryItem = `
        <div class="fj-gallery-item">
          ${address ? `<div class="tag-address">${address}</div>` : ""}
          <img src="${i.url}" ${alt + title}>
        </div>
      `;
        str += galleryItem;
      });

      return str;
    };

    const lazyloadFn = (i, arr, limit) => {
      const loadItem = Number(limit);
      const arrLength = arr.length;
      if (arrLength > loadItem) i.insertAdjacentHTML("beforeend", htmlStr(arr.splice(0, loadItem)));
      else {
        i.insertAdjacentHTML("beforeend", htmlStr(arr));
        i.classList.remove("lazyload");
      }
      window.lazyLoadInstance && window.lazyLoadInstance.update();
      return arrLength > loadItem ? loadItem : arrLength;
    };

    const fetchUrl = async url => {
      const response = await fetch(url);
      return await response.json();
    };

    const runJustifiedGallery = (item, arr) => {
      const limit = item.getAttribute("data-limit") ?? arr.length;
      if (!item.classList.contains("lazyload") || arr.length < limit) {
        // 不懒加载
        item.innerHTML = htmlStr(arr);
        item.nextElementSibling.style.display = "none";
      } else {
        if (!item.classList.contains("btn_album_detail_lazyload") || item.classList.contains("page_img_lazyload")) {
          // 滚动懒加载
          lazyloadFn(item, arr, limit);
          const clickBtnFn = () => {
            const lastItemLength = lazyloadFn(item, arr, limit);
            fjGallery(
              item,
              "appendImages",
              item.querySelectorAll(`.fj-gallery-item:nth-last-child(-n+${lastItemLength})`)
            );
            anzhiyu.loadLightbox(item.querySelectorAll("img"));
            if (lastItemLength < Number(limit)) {
              observer.unobserve(item.nextElementSibling);
            }
          };

          // 创建IntersectionObserver实例
          const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
              // 如果元素进入视口
              if (entry.isIntersecting) {
                // 执行clickBtnFn函数
                setTimeout(clickBtnFn(), 100);
              }
            });
          });
          observer.observe(item.nextElementSibling);
        } else {
          // 相册详情 按钮懒加载
          lazyloadFn(item, arr, limit);
          const clickBtnFn = () => {
            const lastItemLength = lazyloadFn(item, arr, limit);
            fjGallery(
              item,
              "appendImages",
              item.querySelectorAll(`.fj-gallery-item:nth-last-child(-n+${lastItemLength})`)
            );
            anzhiyu.loadLightbox(item.querySelectorAll("img"));
            lastItemLength < limit && item.nextElementSibling.removeEventListener("click", clickBtnFn);
          };
          item.nextElementSibling.addEventListener("click", clickBtnFn);
        }
      }

      anzhiyu.initJustifiedGallery(item);
      anzhiyu.loadLightbox(item.querySelectorAll("img"));
      window.lazyLoadInstance && window.lazyLoadInstance.update();
    };

    const addJustifiedGallery = () => {
      ele.forEach(item => {
        item.classList.contains("url")
          ? fetchUrl(item.textContent).then(res => {
              runJustifiedGallery(item, res);
            })
          : runJustifiedGallery(item, JSON.parse(item.textContent));
      });
    };

    if (window.fjGallery) {
      addJustifiedGallery();
      return;
    }

    getCSS(`${GLOBAL_CONFIG.source.justifiedGallery.css}`);
    getScript(`${GLOBAL_CONFIG.source.justifiedGallery.js}`).then(addJustifiedGallery);
  };

  /**
   * 滚动处理
   */
  const scrollFn = function () {
    const $rightside = document.getElementById("rightside");
    const innerHeight = window.innerHeight + 56;
    let lastScrollTop = 0;

    if (document.body.scrollHeight <= innerHeight) {
      $rightside.style.cssText = "opacity: 1; transform: translateX(-58px)";
    }

    // find the scroll direction
    function scrollDirection(currentTop) {
      const result = currentTop > initTop; // true is down & false is up
      initTop = currentTop;
      return result;
    }

    let initTop = 0;
    let isChatShow = true;
    const $header = document.getElementById("page-header");
    const isChatBtnHide = typeof chatBtnHide === "function";
    const isChatBtnShow = typeof chatBtnShow === "function";

    // 第一次滑动到底部的标识符
    let scrollBottomFirstFlag = false;
    // 缓存常用dom元素
    const musicDom = document.getElementById("nav-music"),
      footerDom = document.getElementById("footer"),
      waterfallDom = document.getElementById("waterfall"),
      $percentBtn = document.getElementById("percent"),
      $navTotop = document.getElementById("nav-totop"),
      $bodyWrap = document.getElementById("body-wrap");
    // 页面底部Dom是否存在
    let pageBottomDomFlag = document.getElementById("post-comment") || document.getElementById("footer");

    function percentageScrollFn(currentTop) {
      // 处理滚动百分比
      let docHeight = $bodyWrap.clientHeight;
      const winHeight = document.documentElement.clientHeight;
      const contentMath =
        docHeight > winHeight ? docHeight - winHeight : document.documentElement.scrollHeight - winHeight;
      const scrollPercent = currentTop / contentMath;
      const scrollPercentRounded = Math.round(scrollPercent * 100);
      const percentage = scrollPercentRounded > 100 ? 100 : scrollPercentRounded <= 0 ? 1 : scrollPercentRounded;
      $percentBtn.textContent = percentage;

      function isInViewPortOfOneNoDis(el) {
        if (!el) return;
        const elDisplay = window.getComputedStyle(el).getPropertyValue("display");
        if (elDisplay == "none") {
          return;
        }
        const viewPortHeight =
          window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        const offsetTop = el.offsetTop;
        const scrollTop = document.documentElement.scrollTop;
        const top = offsetTop - scrollTop;
        return top <= viewPortHeight;
      }

      if (isInViewPortOfOneNoDis(pageBottomDomFlag) || percentage > 90) {
        $navTotop.classList.add("long");
        $percentBtn.textContent = "Top";
      } else {
        $navTotop.classList.remove("long");
        $percentBtn.textContent = percentage;
      }

      // 如果当前页面需要瀑布流，就处理瀑布流
      if (waterfallDom) {
        const waterfallResult = currentTop % document.documentElement.clientHeight; // 卷去一个视口
        if (!scrollBottomFirstFlag && waterfallResult + 100 >= document.documentElement.clientHeight) {
          console.info(waterfallResult, document.documentElement.clientHeight);
          setTimeout(() => {
            waterfall("#waterfall");
          }, 500);
        } else {
          setTimeout(() => {
            waterfallDom && waterfall("#waterfall");
          }, 500);
        }
      }
    }

    const scroolTask = anzhiyu.throttle(() => {
      const currentTop = window.scrollY || document.documentElement.scrollTop;
      const isDown = scrollDirection(currentTop);

      const delta = Math.abs(lastScrollTop - currentTop);
      if (currentTop > 60 && delta < 20 && delta != 0) {
        // ignore small scrolls
        return;
      }
      lastScrollTop = currentTop;
      if (currentTop > 26) {
        if (isDown) {
          if ($header.classList.contains("nav-visible")) $header.classList.remove("nav-visible");
          if (isChatBtnShow && isChatShow === true) {
            chatBtnHide();
            isChatShow = false;
          }
        } else {
          if (!$header.classList.contains("nav-visible")) $header.classList.add("nav-visible");
          if (isChatBtnHide && isChatShow === false) {
            chatBtnShow();
            isChatShow = true;
          }
        }
        requestAnimationFrame(() => {
          anzhiyu.initThemeColor();
          $header.classList.add("nav-fixed");
        });
        if (window.getComputedStyle($rightside).getPropertyValue("opacity") === "0") {
          $rightside.style.cssText = "opacity: 0.8; transform: translateX(-58px)";
        }
      } else {
        if (currentTop <= 5) {
          requestAnimationFrame(() => {
            $header.classList.remove("nav-fixed");
            $header.classList.remove("nav-visible");
            // 修改顶栏颜色
            anzhiyu.initThemeColor();
          });
        }
        $rightside.style.cssText = "opacity: ''; transform: ''";
      }

      if (document.body.scrollHeight <= innerHeight) {
        $rightside.style.cssText = "opacity: 0.8; transform: translateX(-58px)";
      }

      percentageScrollFn(currentTop);
    }, 96);

    // 进入footer隐藏音乐
    if (footerDom) {
      anzhiyu
        .intersectionObserver(
          () => {
            if (footerDom && musicDom && 768 < document.body.clientWidth) {
              musicDom.style.bottom = "-10px";
              musicDom.style.opacity = "0";
            }
            scrollBottomFirstFlag = true;
          },
          () => {
            if (footerDom && musicDom && 768 < document.body.clientWidth) {
              musicDom.style.bottom = "20px";
              musicDom.style.opacity = "1";
            }
          }
        )()
        .observe(footerDom);
    }

    window.scrollCollect = scroolTask;
    window.addEventListener("scroll", scrollCollect);
  };

  /**
   * toc,anchor
   */
  const scrollFnToDo = function () {
    const isToc = GLOBAL_CONFIG_SITE.isToc;
    const isAnchor = GLOBAL_CONFIG.isAnchor;
    const $article = document.getElementById("article-container");

    if (!($article && (isToc || isAnchor))) return;

    let $tocLink, $cardToc, autoScrollToc, isExpand;
    if (isToc) {
      const $cardTocLayout = document.getElementById("card-toc");
      $cardToc = $cardTocLayout.getElementsByClassName("toc-content")[0];
      $tocLink = $cardToc.querySelectorAll(".toc-link");
      isExpand = $cardToc.classList.contains("is-expand");

      window.mobileToc = {
        open: () => {
          $cardTocLayout.style.cssText = "animation: toc-open .3s; opacity: 1; right: 55px";
        },

        close: () => {
          $cardTocLayout.style.animation = "toc-close .2s";
          setTimeout(() => {
            $cardTocLayout.style.cssText = "opacity:''; animation: ''; right: ''";
          }, 100);
        },
      };

      // toc元素點擊
      $cardToc.addEventListener("click", e => {
        e.preventDefault();
        const target = e.target.classList;
        if (target.contains("toc-content")) return;
        const $target = target.contains("toc-link") ? e.target : e.target.parentElement;
        anzhiyu.scrollToDest(
          anzhiyu.getEleTop(document.getElementById(decodeURI($target.getAttribute("href")).replace("#", ""))) - 60,
          300
        );
        if (window.innerWidth < 900) {
          window.mobileToc.close();
        }
      });

      autoScrollToc = item => {
        const activePosition = item.getBoundingClientRect().top;
        const sidebarScrollTop = $cardToc.scrollTop;
        if (activePosition > document.documentElement.clientHeight - 100) {
          $cardToc.scrollTop = sidebarScrollTop + 150;
        }
        if (activePosition < 100) {
          $cardToc.scrollTop = sidebarScrollTop - 150;
        }
      };
    }

    // find head position & add active class
    const list = $article.querySelectorAll("h1,h2,h3,h4,h5,h6");
    let detectItem = "";
    const findHeadPosition = function (top) {
      if (top === 0) {
        return false;
      }

      let currentId = "";
      let currentIndex = "";

      list.forEach(function (ele, index) {
        if (top > anzhiyu.getEleTop(ele) - 80) {
          const id = ele.id;
          currentId = id ? "#" + encodeURI(id) : "";
          currentIndex = index;
        }
      });

      if (detectItem === currentIndex) return;

      if (isAnchor) anzhiyu.updateAnchor(currentId);

      detectItem = currentIndex;

      if (isToc) {
        $cardToc.querySelectorAll(".active").forEach(i => {
          i.classList.remove("active");
        });

        if (currentId === "") {
          return;
        }

        const currentActive = $tocLink[currentIndex];
        currentActive.classList.add("active");

        setTimeout(() => {
          autoScrollToc(currentActive);
        }, 0);

        if (isExpand) return;
        let parent = currentActive.parentNode;

        for (; !parent.matches(".toc"); parent = parent.parentNode) {
          if (parent.matches("li")) parent.classList.add("active");
        }
      }
    };

    // main of scroll
    window.tocScrollFn = anzhiyu.throttle(() => {
      const currentTop = window.scrollY || document.documentElement.scrollTop;
      findHeadPosition(currentTop);
    }, 96);

    window.addEventListener("scroll", tocScrollFn);
  };

  /**
   * Rightside
   */
  const rightSideFn = {
    switchReadMode: () => {
      // read-mode
      const $body = document.body;
      $body.classList.add("read-mode");
      const newEle = document.createElement("button");
      newEle.type = "button";
      newEle.className = "anzhiyufont anzhiyu-icon-sign-out-alt exit-readmode";
      $body.appendChild(newEle);

      function clickFn() {
        $body.classList.remove("read-mode");
        newEle.remove();
        newEle.removeEventListener("click", clickFn);
      }

      newEle.addEventListener("click", clickFn);
    },
    showOrHideBtn: e => {
      // rightside 點擊設置 按鈕 展開
      const rightsideHideClassList = document.getElementById("rightside-config-hide").classList;
      rightsideHideClassList.toggle("show");
      if (e.classList.contains("show")) {
        rightsideHideClassList.add("status");
        setTimeout(() => {
          rightsideHideClassList.remove("status");
        }, 300);
      }
      e.classList.toggle("show");
    },
    scrollToTop: () => {
      // Back to top
      anzhiyu.scrollToDest(0, 500);
    },
    hideAsideBtn: () => {
      // Hide aside
      const $htmlDom = document.documentElement.classList;
      $htmlDom.contains("hide-aside")
        ? saveToLocal.set("aside-status", "show", 2)
        : saveToLocal.set("aside-status", "hide", 2);
      $htmlDom.toggle("hide-aside");
    },

    runMobileToc: () => {
      if (window.getComputedStyle(document.getElementById("card-toc")).getPropertyValue("opacity") === "0")
        window.mobileToc.open();
      else window.mobileToc.close();
    },
  };

  document.getElementById("rightside").addEventListener("click", function (e) {
    const $target = e.target.id ? e.target : e.target.parentNode;
    switch ($target.id) {
      case "go-up":
        rightSideFn.scrollToTop();
        break;
      case "rightside_config":
        rightSideFn.showOrHideBtn($target);
        break;
      case "mobile-toc-button":
        rightSideFn.runMobileToc();
        break;
      case "readmode":
        rightSideFn.switchReadMode();
        break;
      case "darkmode":
        anzhiyu.switchDarkMode();
        break;
      case "hide-aside-btn":
        rightSideFn.hideAsideBtn();
        break;
      default:
        break;
    }
  });

  //监听蒙版关闭
  document.addEventListener(
    "touchstart",
    e => {
      anzhiyu.removeRewardMask();
    },
    { passive: true }
  );

  /**
   * menu
   * 側邊欄sub-menu 展開/收縮
   */
  const clickFnOfSubMenu = () => {
    document.querySelectorAll("#sidebar-menus .site-page.group").forEach(function (item) {
      item.addEventListener("click", function () {
        this.classList.toggle("hide");
      });
    });
  };

  /**
   * 複製時加上版權信息
   */
  const addCopyright = () => {
    const copyright = GLOBAL_CONFIG.copyright;
    document.body.oncopy = e => {
      e.preventDefault();
      let textFont;
      const copyFont = window.getSelection(0).toString();
      if (copyFont.length > copyright.limitCount) {
        textFont =
          copyFont +
          "\n" +
          "\n" +
          "\n" +
          copyright.languages.author +
          "\n" +
          copyright.languages.link +
          window.location.href +
          "\n" +
          copyright.languages.source +
          "\n" +
          copyright.languages.info;
      } else {
        textFont = copyFont;
      }
      if (e.clipboardData) {
        return e.clipboardData.setData("text", textFont);
      } else {
        return window.clipboardData.setData("text", textFont);
      }
    };
  };

  /**
   * 網頁運行時間
   */
  const addRuntime = () => {
    const $runtimeCount = document.getElementById("runtimeshow");
    if ($runtimeCount) {
      const publishDate = $runtimeCount.getAttribute("data-publishDate");
      $runtimeCount.innerText = anzhiyu.diffDate(publishDate) + " " + GLOBAL_CONFIG.runtime;
    }
  };

  /**
   * 最後一次更新時間
   */
  const addLastPushDate = () => {
    const $lastPushDateItem = document.getElementById("last-push-date");
    if ($lastPushDateItem) {
      const lastPushDate = $lastPushDateItem.getAttribute("data-lastPushDate");
      $lastPushDateItem.innerText = anzhiyu.diffDate(lastPushDate, true);
    }
  };

  /**
   * table overflow
   */
  const addTableWrap = () => {
    const $table = document.querySelectorAll("#article-container :not(.highlight) > table, #article-container > table");
    if ($table.length) {
      $table.forEach(item => {
        anzhiyu.wrap(item, "div", { class: "table-wrap" });
      });
    }
  };

  /**
   * tag-hide
   */
  const clickFnOfTagHide = function () {
    const $hideInline = document.querySelectorAll("#article-container .hide-button");
    if ($hideInline.length) {
      $hideInline.forEach(function (item) {
        item.addEventListener("click", function (e) {
          const $this = this;
          $this.classList.add("open");
          const $fjGallery = $this.nextElementSibling.querySelectorAll(".fj-gallery");
          $fjGallery.length && anzhiyu.initJustifiedGallery($fjGallery);
        });
      });
    }
  };

  const tabsFn = {
    clickFnOfTabs: function () {
      document.querySelectorAll("#article-container .tab > button").forEach(function (item) {
        item.addEventListener("click", function (e) {
          const $this = this;
          const $tabItem = $this.parentNode;

          if (!$tabItem.classList.contains("active")) {
            const $tabContent = $tabItem.parentNode.nextElementSibling;
            const $siblings = anzhiyu.siblings($tabItem, ".active")[0];
            $siblings && $siblings.classList.remove("active");
            $tabItem.classList.add("active");
            const tabId = $this.getAttribute("data-href").replace("#", "");
            const childList = [...$tabContent.children];
            childList.forEach(item => {
              if (item.id === tabId) item.classList.add("active");
              else item.classList.remove("active");
            });
            const $isTabJustifiedGallery = $tabContent.querySelectorAll(`#${tabId} .fj-gallery`);
            if ($isTabJustifiedGallery.length > 0) {
              anzhiyu.initJustifiedGallery($isTabJustifiedGallery);
            }
          }
        });
      });
    },
    backToTop: () => {
      document.querySelectorAll("#article-container .tabs .tab-to-top").forEach(function (item) {
        item.addEventListener("click", function () {
          anzhiyu.scrollToDest(anzhiyu.getEleTop(anzhiyu.getParents(this, ".tabs")) - 60, 300);
        });
      });
    },
  };

  const toggleCardCategory = function () {
    const $cardCategory = document.querySelectorAll("#aside-cat-list .card-category-list-item.parent i");
    if ($cardCategory.length) {
      $cardCategory.forEach(function (item) {
        item.addEventListener("click", function (e) {
          e.preventDefault();
          const $this = this;
          $this.classList.toggle("expand");
          const $parentEle = $this.parentNode.nextElementSibling;
          if (anzhiyu.isHidden($parentEle)) {
            $parentEle.style.display = "block";
          } else {
            $parentEle.style.display = "none";
          }
        });
      });
    }
  };

  const switchComments = function () {
    let switchDone = false;
    const $switchBtn = document.querySelector("#comment-switch > .switch-btn");
    $switchBtn &&
      $switchBtn.addEventListener("click", function () {
        this.classList.toggle("move");
        document.querySelectorAll("#post-comment > .comment-wrap > div").forEach(function (item) {
          if (anzhiyu.isHidden(item)) {
            item.style.cssText = "display: block;animation: tabshow .5s";
          } else {
            item.style.cssText = "display: none;animation: ''";
          }
        });

        if (!switchDone && typeof loadOtherComment === "function") {
          switchDone = true;
          loadOtherComment();
        }
      });
  };

  const addPostOutdateNotice = function () {
    const data = GLOBAL_CONFIG.noticeOutdate;
    const diffDay = anzhiyu.diffDate(GLOBAL_CONFIG_SITE.postUpdate);
    if (diffDay >= data.limitDay) {
      const ele = document.createElement("div");
      ele.className = "post-outdate-notice";
      ele.textContent = data.messagePrev + " " + diffDay + " " + data.messageNext;
      const $targetEle = document.getElementById("article-container");
      if (data.position === "top") {
        $targetEle.insertBefore(ele, $targetEle.firstChild);
      } else {
        $targetEle.appendChild(ele);
      }
    }
  };

  const lazyloadImg = () => {
    window.lazyLoadInstance = new LazyLoad({
      elements_selector: "img",
      threshold: 0,
      data_src: "lazy-src",
    });
  };

  const relativeDate = function (selector, simple = false) {
    selector.forEach(item => {
      const $this = item;
      const timeVal = $this.getAttribute("datetime");
      if (simple) {
        $this.innerText = anzhiyu.diffDate(timeVal, false, simple);
      } else {
        $this.innerText = anzhiyu.diffDate(timeVal, true);
      }
      $this.style.display = "inline";
    });
  };

  const mouseleaveHomeCard = function () {
    const topGroup = document.querySelector(".topGroup");
    if (!topGroup) return;
    //首页大卡片恢复显示
    topGroup.addEventListener("mouseleave", function () {
      document.getElementById("todayCard").classList.remove("hide");
      document.getElementById("todayCard").style.zIndex = 1;
    });
  };

  // 表情放大
  const owoBig = function () {
    let flag = 1, // 设置节流阀
      owo_time = "", // 设置计时器
      m = 3; // 设置放大倍数
    // 创建盒子
    let div = document.createElement("div");
    // 设置ID
    div.id = "owo-big";
    // 插入盒子
    let body = document.querySelector("body");
    body.appendChild(div);

    // 监听 post-comment 元素的子元素添加事件
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        const addedNodes = mutation.addedNodes;
        // 判断新增的节点中是否包含 OwO-body 类名的元素
        for (let i = 0; i < addedNodes.length; i++) {
          const node = addedNodes[i];
          if (
            node.nodeType === Node.ELEMENT_NODE &&
            node.classList.contains("OwO-body") &&
            !node.classList.contains("comment-barrage")
          ) {
            const owo_body = node;
            // 禁用右键（手机端长按会出现右键菜单，为了体验给禁用掉）
            owo_body.addEventListener("contextmenu", e => e.preventDefault());
            // 鼠标移入
            owo_body.addEventListener("mouseover", handleMouseOver);
            // 鼠标移出
            owo_body.addEventListener("mouseout", handleMouseOut);
          }
        }
      });
    });

    // 配置 MutationObserver 选项
    const config = { childList: true, subtree: true };

    // 开始监听
    observer.observe(document.getElementById("post-comment"), config);

    function handleMouseOver(e) {
      if (e.target.tagName == "IMG" && flag) {
        flag = 0;
        // 移入100毫秒后显示盒子
        owo_time = setTimeout(() => {
          let height = e.target.clientHeight * m; // 盒子高
          let width = e.target.clientWidth * m; // 盒子宽
          let left = e.x - e.offsetX - (width - e.target.clientWidth) / 2; // 盒子与屏幕左边距离
          if (left + width > body.clientWidth) {
            left -= left + width - body.clientWidth + 10;
          } // 右边缘检测，防止超出屏幕
          if (left < 0) left = 10; // 左边缘检测，防止超出屏幕
          let top = e.y - e.offsetY; // 盒子与屏幕顶部距离

          // 设置盒子样式
          div.style.height = height + "px";
          div.style.width = width + "px";
          div.style.left = left + "px";
          div.style.top = top + "px";
          div.style.display = "flex";
          // 在盒子中插入图片
          div.innerHTML = `<img src="${e.target.src}">`;
        }, 100);
      }
    }

    function handleMouseOut(e) {
      // 隐藏盒子
      div.style.display = "none";
      flag = 1;
      clearTimeout(owo_time);
    }
  };

  //封面纯色
  const coverColor = async () => {
    const root = document.querySelector(":root");
    const path = document.getElementById("post-top-bg")?.src;
    if (!path) {
      // 非文章情况，直接设置不需要请求了
      root.style.setProperty("--anzhiyu-bar-background", "var(--anzhiyu-meta-theme-color)");
      anzhiyu.initThemeColor();

      // 要改回来默认主色
      document.documentElement.style.setProperty(
        "--anzhiyu-main",
        getComputedStyle(document.documentElement).getPropertyValue("--anzhiyu-theme")
      );
      document.documentElement.style.setProperty(
        "--anzhiyu-theme-op",
        getComputedStyle(document.documentElement).getPropertyValue("--anzhiyu-main") + "23"
      );
      document.documentElement.style.setProperty(
        "--anzhiyu-theme-op-deep",
        getComputedStyle(document.documentElement).getPropertyValue("--anzhiyu-main") + "dd"
      );

      return;
    }

    // 文章内
    if (GLOBAL_CONFIG.mainTone) {
      const fallbackValue = "var(--anzhiyu-theme)";
      let fetchPath = "";
      if (GLOBAL_CONFIG.mainTone.mode == "cdn" || GLOBAL_CONFIG.mainTone.mode == "both") {
        fetchPath = path + "?imageAve";
      } else if (GLOBAL_CONFIG.mainTone.mode == "api") {
        fetchPath = GLOBAL_CONFIG.mainTone.api + path;
      }
      // cdn/api模式请求
      try {
        const response = await fetch(fetchPath);
        if (response.ok && response.headers.get("content-type")?.includes("application/json")) {
          const obj = await response.json();
          let value =
            GLOBAL_CONFIG.mainTone.mode == "cdn" || GLOBAL_CONFIG.mainTone.mode == "both"
              ? "#" + obj.RGB.slice(2)
              : obj.RGB;
          if (getContrastYIQ(value) === "light") {
            value = LightenDarkenColor(colorHex(value), -40);
          }

          root.style.setProperty("--anzhiyu-bar-background", value);
          anzhiyu.initThemeColor();

          if (GLOBAL_CONFIG.mainTone.cover_change) {
            document.documentElement.style.setProperty("--anzhiyu-main", value);
            document.documentElement.style.setProperty(
              "--anzhiyu-theme-op",
              getComputedStyle(document.documentElement).getPropertyValue("--anzhiyu-main") + "23"
            );
            document.documentElement.style.setProperty(
              "--anzhiyu-theme-op-deep",
              getComputedStyle(document.documentElement).getPropertyValue("--anzhiyu-main") + "dd"
            );
          }
        } else {
          if (GLOBAL_CONFIG.mainTone.mode == "both") {
            // both继续请求
            try {
              const response = await fetch(GLOBAL_CONFIG.mainTone.api + path);
              if (response.ok && response.headers.get("content-type")?.includes("application/json")) {
                const obj = await response.json();
                let value = obj.RGB;

                if (getContrastYIQ(value) === "light") {
                  value = LightenDarkenColor(colorHex(value), -40);
                }

                root.style.setProperty("--anzhiyu-bar-background", value);
                anzhiyu.initThemeColor();

                if (GLOBAL_CONFIG.mainTone.cover_change) {
                  document.documentElement.style.setProperty("--anzhiyu-main", value);
                  document.documentElement.style.setProperty(
                    "--anzhiyu-theme-op",
                    getComputedStyle(document.documentElement).getPropertyValue("--anzhiyu-main") + "23"
                  );
                  document.documentElement.style.setProperty(
                    "--anzhiyu-theme-op-deep",
                    getComputedStyle(document.documentElement).getPropertyValue("--anzhiyu-main") + "dd"
                  );
                }
              } else {
                root.style.setProperty("--anzhiyu-bar-background", fallbackValue);
                anzhiyu.initThemeColor();
                document.documentElement.style.setProperty("--anzhiyu-main", fallbackValue);
              }
            } catch {
              root.style.setProperty("--anzhiyu-bar-background", fallbackValue);
              anzhiyu.initThemeColor();
              document.documentElement.style.setProperty("--anzhiyu-main", fallbackValue);
            }
          } else {
            root.style.setProperty("--anzhiyu-bar-background", fallbackValue);
            anzhiyu.initThemeColor();
            document.documentElement.style.setProperty("--anzhiyu-main", fallbackValue);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        root.style.setProperty("--anzhiyu-bar-background", fallbackValue);
        anzhiyu.initThemeColor();
        document.documentElement.style.setProperty("--anzhiyu-main", fallbackValue);
      }
    }
  };

  //RGB颜色转化为16进制颜色
  const colorHex = str => {
    const hexRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

    if (/^(rgb|RGB)/.test(str)) {
      const aColor = str.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
      return aColor.reduce((acc, val) => {
        const hex = Number(val).toString(16).padStart(2, "0");
        return acc + hex;
      }, "#");
    }

    if (hexRegex.test(str)) {
      if (str.length === 4) {
        return Array.from(str.slice(1)).reduce((acc, val) => acc + val + val, "#");
      }
      return str;
    }

    return str;
  };

  //16进制颜色转化为RGB颜色
  const colorRgb = str => {
    const hexRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
    let sColor = str.toLowerCase();

    if (sColor && hexRegex.test(sColor)) {
      if (sColor.length === 4) {
        sColor = Array.from(sColor.slice(1)).reduce((acc, val) => acc + val + val, "#");
      }

      const sColorChange = Array.from({ length: 3 }, (_, i) => parseInt(sColor.slice(i * 2 + 1, i * 2 + 3), 16));

      return `rgb(${sColorChange.join(",")})`;
    }

    return sColor;
  };

  // Lighten or darken a color
  const LightenDarkenColor = (col, amt) => {
    const usePound = col.startsWith("#");

    if (usePound) {
      col = col.slice(1);
    }

    let num = parseInt(col, 16);

    const processColor = (colorValue, amount) => {
      colorValue += amount;
      return colorValue > 255 ? 255 : colorValue < 0 ? 0 : colorValue;
    };

    const r = processColor(num >> 16, amt);
    const b = processColor((num >> 8) & 0x00ff, amt);
    const g = processColor(num & 0x0000ff, amt);

    return (usePound ? "#" : "") + String("000000" + (g | (b << 8) | (r << 16)).toString(16)).slice(-6);
  };

  // Determine whether a color is light or dark
  const getContrastYIQ = hexcolor => {
    const colorRgb = color => {
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      color = color.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
      return result ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : null;
    };

    const colorrgb = colorRgb(hexcolor);
    const colors = colorrgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

    const [_, red, green, blue] = colors;

    const brightness = (red * 299 + green * 587 + blue * 114) / 255000;

    return brightness >= 0.5 ? "light" : "dark";
  };

  //监听跳转页面输入框是否按下回车
  const listenToPageInputPress = function () {
    var input = document.getElementById("toPageText");
    if (input) {
      input.addEventListener("keydown", event => {
        if (event.keyCode === 13) {
          // 如果按下的是回车键，则执行特定的函数
          anzhiyu.toPage();
          var link = document.getElementById("toPageButton");
          var href = link.href;
          pjax.loadUrl(href);
        }
      });
    }
  };

  // 监听nav是否被其他音频暂停⏸️

  // 开发者工具键盘监听
  window.onkeydown = function (e) {
    123 === e.keyCode && anzhiyu.snackbarShow("开发者模式已打开，请遵循GPL协议", !1);
  };

  const unRefreshFn = function () {
    window.addEventListener("resize", () => {
      adjustMenu(false);
      anzhiyu.isHidden(document.getElementById("toggle-menu")) && mobileSidebarOpen && sidebarFn.close();
    });

    anzhiyu.darkModeStatus();

    document.getElementById("menu-mask").addEventListener("click", e => {
      sidebarFn.close();
    });
    GLOBAL_CONFIG.islazyload && lazyloadImg();
    GLOBAL_CONFIG.copyright !== undefined && addCopyright();
    if (GLOBAL_CONFIG.shortcutKey && document.getElementById("consoleKeyboard")) {
      localStorage.setItem("keyboardToggle", "true");
      document.getElementById("consoleKeyboard").classList.add("on");
      anzhiyu_keyboard = true;
    }
    clickFnOfSubMenu();
  };

  window.refreshFn = function () {
    initAdjust();

    if (GLOBAL_CONFIG_SITE.isPost) {
      GLOBAL_CONFIG.noticeOutdate !== undefined && addPostOutdateNotice();
      GLOBAL_CONFIG.relativeDate.post && relativeDate(document.querySelectorAll("#post-meta time"));
    } else {
      if (GLOBAL_CONFIG.relativeDate.homepage) {
        relativeDate(document.querySelectorAll("#recent-posts time"));
      } else if (GLOBAL_CONFIG.relativeDate.simplehomepage) {
        relativeDate(document.querySelectorAll("#recent-posts time"), true);
      }
      GLOBAL_CONFIG.runtime && addRuntime();
      addLastPushDate();
      toggleCardCategory();
    }

    scrollFnToDo();
    GLOBAL_CONFIG_SITE.isHome && scrollDownInIndex();
    addHighlightTool();
    GLOBAL_CONFIG.isPhotoFigcaption && addPhotoFigcaption();
    scrollFn();

    // 刷新时第一次滚动百分比
    window.scrollCollect && window.scrollCollect();

    const $jgEle = document.querySelectorAll("#content-inner .fj-gallery");
    $jgEle.length && runJustifiedGallery($jgEle);

    runLightbox();
    addTableWrap();
    clickFnOfTagHide();
    tabsFn.clickFnOfTabs();
    tabsFn.backToTop();
    switchComments();
    document.getElementById("toggle-menu").addEventListener("click", () => {
      sidebarFn.open();
    });

    // 如果当前页有评论就执行函数
    if (document.getElementById("post-comment")) owoBig();

    mouseleaveHomeCard();
    coverColor();
    listenToPageInputPress();
  };

  refreshFn();
  unRefreshFn();
});


document.addEventListener("DOMContentLoaded", function () {
  const translate = GLOBAL_CONFIG.translate;
  const snackbarData = GLOBAL_CONFIG.Snackbar;
  const defaultEncoding = translate.defaultEncoding; // 網站默認語言，1: 繁體中文, 2: 簡體中文
  const translateDelay = translate.translateDelay; // 延遲時間,若不在前, 要設定延遲翻譯時間, 如100表示100ms,默認為0
  const msgToTraditionalChinese = translate.msgToTraditionalChinese; // 此處可以更改為你想要顯示的文字
  const msgToSimplifiedChinese = translate.msgToSimplifiedChinese; // 同上，但兩處均不建議更改
  const rightMenuMsgToTraditionalChinese = translate.rightMenuMsgToTraditionalChinese; // 此處可以更改為你想要顯示的文字
  const rightMenuMsgToSimplifiedChinese = translate.rightMenuMsgToSimplifiedChinese; // 同上，但兩處均不建議更改
  let currentEncoding = defaultEncoding;
  const targetEncodingCookie = "translate-chn-cht";
  let targetEncoding =
    saveToLocal.get(targetEncodingCookie) === undefined
      ? defaultEncoding
      : Number(saveToLocal.get("translate-chn-cht"));
  let translateButtonObject;
  let translateRightMenuButtonObject;
  const isSnackbar = GLOBAL_CONFIG.Snackbar !== undefined;

  function setLang() {
    document.documentElement.lang = targetEncoding === 1 ? "zh-TW" : "zh-CN";
  }

  function translateText(txt) {
    if (txt === "" || txt == null) return "";
    if (currentEncoding === 1 && targetEncoding === 2) return Simplized(txt);
    else if (currentEncoding === 2 && targetEncoding === 1) {
      return Traditionalized(txt);
    } else return txt;
  }
  function translateBody(fobj) {
    let objs;
    if (typeof fobj === "object") objs = fobj.childNodes;
    else objs = document.body.childNodes;
    for (let i = 0; i < objs.length; i++) {
      const obj = objs.item(i);
      if (
        "||BR|HR|".indexOf("|" + obj.tagName + "|") > 0 ||
        obj === translateButtonObject ||
        obj === translateRightMenuButtonObject
      ) {
        continue;
      }
      if (obj.title !== "" && obj.title != null) {
        obj.title = translateText(obj.title);
      }
      if (obj.alt !== "" && obj.alt != null) obj.alt = translateText(obj.alt);
      if (obj.placeholder !== "" && obj.placeholder != null) {
        obj.placeholder = translateText(obj.placeholder);
      }
      if (obj.tagName === "INPUT" && obj.value !== "" && obj.type !== "text" && obj.type !== "hidden") {
        obj.value = translateText(obj.value);
      }
      if (obj.nodeType === 3) obj.data = translateText(obj.data);
      else translateBody(obj);
    }
  }
  function translatePage() {
    if (rm) rm.hideRightMenu();
    if (targetEncoding === 1) {
      currentEncoding = 1;
      targetEncoding = 2;
      translateButtonObject.innerHTML = msgToTraditionalChinese;
      translateRightMenuButtonObject.innerHTML = rightMenuMsgToTraditionalChinese;
      isSnackbar && anzhiyu.snackbarShow(snackbarData.cht_to_chs);
    } else if (targetEncoding === 2) {
      currentEncoding = 2;
      targetEncoding = 1;
      translateButtonObject.innerHTML = msgToSimplifiedChinese;
      translateRightMenuButtonObject.innerHTML = rightMenuMsgToSimplifiedChinese;
      isSnackbar && anzhiyu.snackbarShow(snackbarData.chs_to_cht);
    }
    saveToLocal.set(targetEncodingCookie, targetEncoding, 2);
    setLang();
    translateBody();
  }

  function JTPYStr() {
    return "万与丑专业丛东丝丢两严丧个丬丰临为丽举么义乌乐乔习乡书买乱争于亏云亘亚产亩亲亵亸亿仅从仑仓仪们价众优伙会伛伞伟传伤伥伦伧伪伫体余佣佥侠侣侥侦侧侨侩侪侬俣俦俨俩俪俭债倾偬偻偾偿傥傧储傩儿兑兖党兰关兴兹养兽冁内冈册写军农冢冯冲决况冻净凄凉凌减凑凛几凤凫凭凯击凼凿刍划刘则刚创删别刬刭刽刿剀剂剐剑剥剧劝办务劢动励劲劳势勋勐勚匀匦匮区医华协单卖卢卤卧卫却卺厂厅历厉压厌厍厕厢厣厦厨厩厮县参叆叇双发变叙叠叶号叹叽吁后吓吕吗吣吨听启吴呒呓呕呖呗员呙呛呜咏咔咙咛咝咤咴咸哌响哑哒哓哔哕哗哙哜哝哟唛唝唠唡唢唣唤唿啧啬啭啮啰啴啸喷喽喾嗫呵嗳嘘嘤嘱噜噼嚣嚯团园囱围囵国图圆圣圹场坂坏块坚坛坜坝坞坟坠垄垅垆垒垦垧垩垫垭垯垱垲垴埘埙埚埝埯堑堕塆墙壮声壳壶壸处备复够头夸夹夺奁奂奋奖奥妆妇妈妩妪妫姗姜娄娅娆娇娈娱娲娴婳婴婵婶媪嫒嫔嫱嬷孙学孪宁宝实宠审宪宫宽宾寝对寻导寿将尔尘尧尴尸尽层屃屉届属屡屦屿岁岂岖岗岘岙岚岛岭岳岽岿峃峄峡峣峤峥峦崂崃崄崭嵘嵚嵛嵝嵴巅巩巯币帅师帏帐帘帜带帧帮帱帻帼幂幞干并广庄庆庐庑库应庙庞废庼廪开异弃张弥弪弯弹强归当录彟彦彻径徕御忆忏忧忾怀态怂怃怄怅怆怜总怼怿恋恳恶恸恹恺恻恼恽悦悫悬悭悯惊惧惨惩惫惬惭惮惯愍愠愤愦愿慑慭憷懑懒懔戆戋戏戗战戬户扎扑扦执扩扪扫扬扰抚抛抟抠抡抢护报担拟拢拣拥拦拧拨择挂挚挛挜挝挞挟挠挡挢挣挤挥挦捞损捡换捣据捻掳掴掷掸掺掼揸揽揿搀搁搂搅携摄摅摆摇摈摊撄撑撵撷撸撺擞攒敌敛数斋斓斗斩断无旧时旷旸昙昼昽显晋晒晓晔晕晖暂暧札术朴机杀杂权条来杨杩杰极构枞枢枣枥枧枨枪枫枭柜柠柽栀栅标栈栉栊栋栌栎栏树栖样栾桊桠桡桢档桤桥桦桧桨桩梦梼梾检棂椁椟椠椤椭楼榄榇榈榉槚槛槟槠横樯樱橥橱橹橼檐檩欢欤欧歼殁殇残殒殓殚殡殴毁毂毕毙毡毵氇气氢氩氲汇汉污汤汹沓沟没沣沤沥沦沧沨沩沪沵泞泪泶泷泸泺泻泼泽泾洁洒洼浃浅浆浇浈浉浊测浍济浏浐浑浒浓浔浕涂涌涛涝涞涟涠涡涢涣涤润涧涨涩淀渊渌渍渎渐渑渔渖渗温游湾湿溃溅溆溇滗滚滞滟滠满滢滤滥滦滨滩滪漤潆潇潋潍潜潴澜濑濒灏灭灯灵灾灿炀炉炖炜炝点炼炽烁烂烃烛烟烦烧烨烩烫烬热焕焖焘煅煳熘爱爷牍牦牵牺犊犟状犷犸犹狈狍狝狞独狭狮狯狰狱狲猃猎猕猡猪猫猬献獭玑玙玚玛玮环现玱玺珉珏珐珑珰珲琎琏琐琼瑶瑷璇璎瓒瓮瓯电画畅畲畴疖疗疟疠疡疬疮疯疱疴痈痉痒痖痨痪痫痴瘅瘆瘗瘘瘪瘫瘾瘿癞癣癫癯皑皱皲盏盐监盖盗盘眍眦眬着睁睐睑瞒瞩矫矶矾矿砀码砖砗砚砜砺砻砾础硁硅硕硖硗硙硚确硷碍碛碜碱碹磙礼祎祢祯祷祸禀禄禅离秃秆种积称秽秾稆税稣稳穑穷窃窍窑窜窝窥窦窭竖竞笃笋笔笕笺笼笾筑筚筛筜筝筹签简箓箦箧箨箩箪箫篑篓篮篱簖籁籴类籼粜粝粤粪粮糁糇紧絷纟纠纡红纣纤纥约级纨纩纪纫纬纭纮纯纰纱纲纳纴纵纶纷纸纹纺纻纼纽纾线绀绁绂练组绅细织终绉绊绋绌绍绎经绐绑绒结绔绕绖绗绘给绚绛络绝绞统绠绡绢绣绤绥绦继绨绩绪绫绬续绮绯绰绱绲绳维绵绶绷绸绹绺绻综绽绾绿缀缁缂缃缄缅缆缇缈缉缊缋缌缍缎缏缐缑缒缓缔缕编缗缘缙缚缛缜缝缞缟缠缡缢缣缤缥缦缧缨缩缪缫缬缭缮缯缰缱缲缳缴缵罂网罗罚罢罴羁羟羡翘翙翚耢耧耸耻聂聋职聍联聩聪肃肠肤肷肾肿胀胁胆胜胧胨胪胫胶脉脍脏脐脑脓脔脚脱脶脸腊腌腘腭腻腼腽腾膑臜舆舣舰舱舻艰艳艹艺节芈芗芜芦苁苇苈苋苌苍苎苏苘苹茎茏茑茔茕茧荆荐荙荚荛荜荞荟荠荡荣荤荥荦荧荨荩荪荫荬荭荮药莅莜莱莲莳莴莶获莸莹莺莼萚萝萤营萦萧萨葱蒇蒉蒋蒌蓝蓟蓠蓣蓥蓦蔷蔹蔺蔼蕲蕴薮藁藓虏虑虚虫虬虮虽虾虿蚀蚁蚂蚕蚝蚬蛊蛎蛏蛮蛰蛱蛲蛳蛴蜕蜗蜡蝇蝈蝉蝎蝼蝾螀螨蟏衅衔补衬衮袄袅袆袜袭袯装裆裈裢裣裤裥褛褴襁襕见观觃规觅视觇览觉觊觋觌觍觎觏觐觑觞触觯詟誉誊讠计订讣认讥讦讧讨让讪讫训议讯记讱讲讳讴讵讶讷许讹论讻讼讽设访诀证诂诃评诅识诇诈诉诊诋诌词诎诏诐译诒诓诔试诖诗诘诙诚诛诜话诞诟诠诡询诣诤该详诧诨诩诪诫诬语诮误诰诱诲诳说诵诶请诸诹诺读诼诽课诿谀谁谂调谄谅谆谇谈谊谋谌谍谎谏谐谑谒谓谔谕谖谗谘谙谚谛谜谝谞谟谠谡谢谣谤谥谦谧谨谩谪谫谬谭谮谯谰谱谲谳谴谵谶谷豮贝贞负贠贡财责贤败账货质贩贪贫贬购贮贯贰贱贲贳贴贵贶贷贸费贺贻贼贽贾贿赀赁赂赃资赅赆赇赈赉赊赋赌赍赎赏赐赑赒赓赔赕赖赗赘赙赚赛赜赝赞赟赠赡赢赣赪赵赶趋趱趸跃跄跖跞践跶跷跸跹跻踊踌踪踬踯蹑蹒蹰蹿躏躜躯车轧轨轩轪轫转轭轮软轰轱轲轳轴轵轶轷轸轹轺轻轼载轾轿辀辁辂较辄辅辆辇辈辉辊辋辌辍辎辏辐辑辒输辔辕辖辗辘辙辚辞辩辫边辽达迁过迈运还这进远违连迟迩迳迹适选逊递逦逻遗遥邓邝邬邮邹邺邻郁郄郏郐郑郓郦郧郸酝酦酱酽酾酿释里鉅鉴銮錾钆钇针钉钊钋钌钍钎钏钐钑钒钓钔钕钖钗钘钙钚钛钝钞钟钠钡钢钣钤钥钦钧钨钩钪钫钬钭钮钯钰钱钲钳钴钵钶钷钸钹钺钻钼钽钾钿铀铁铂铃铄铅铆铈铉铊铋铍铎铏铐铑铒铕铗铘铙铚铛铜铝铞铟铠铡铢铣铤铥铦铧铨铪铫铬铭铮铯铰铱铲铳铴铵银铷铸铹铺铻铼铽链铿销锁锂锃锄锅锆锇锈锉锊锋锌锍锎锏锐锑锒锓锔锕锖锗错锚锜锞锟锠锡锢锣锤锥锦锨锩锫锬锭键锯锰锱锲锳锴锵锶锷锸锹锺锻锼锽锾锿镀镁镂镃镆镇镈镉镊镌镍镎镏镐镑镒镕镖镗镙镚镛镜镝镞镟镠镡镢镣镤镥镦镧镨镩镪镫镬镭镮镯镰镱镲镳镴镶长门闩闪闫闬闭问闯闰闱闲闳间闵闶闷闸闹闺闻闼闽闾闿阀阁阂阃阄阅阆阇阈阉阊阋阌阍阎阏阐阑阒阓阔阕阖阗阘阙阚阛队阳阴阵阶际陆陇陈陉陕陧陨险随隐隶隽难雏雠雳雾霁霉霭靓静靥鞑鞒鞯鞴韦韧韨韩韪韫韬韵页顶顷顸项顺须顼顽顾顿颀颁颂颃预颅领颇颈颉颊颋颌颍颎颏颐频颒颓颔颕颖颗题颙颚颛颜额颞颟颠颡颢颣颤颥颦颧风飏飐飑飒飓飔飕飖飗飘飙飚飞飨餍饤饥饦饧饨饩饪饫饬饭饮饯饰饱饲饳饴饵饶饷饸饹饺饻饼饽饾饿馀馁馂馃馄馅馆馇馈馉馊馋馌馍馎馏馐馑馒馓馔馕马驭驮驯驰驱驲驳驴驵驶驷驸驹驺驻驼驽驾驿骀骁骂骃骄骅骆骇骈骉骊骋验骍骎骏骐骑骒骓骔骕骖骗骘骙骚骛骜骝骞骟骠骡骢骣骤骥骦骧髅髋髌鬓魇魉鱼鱽鱾鱿鲀鲁鲂鲄鲅鲆鲇鲈鲉鲊鲋鲌鲍鲎鲏鲐鲑鲒鲓鲔鲕鲖鲗鲘鲙鲚鲛鲜鲝鲞鲟鲠鲡鲢鲣鲤鲥鲦鲧鲨鲩鲪鲫鲬鲭鲮鲯鲰鲱鲲鲳鲴鲵鲶鲷鲸鲹鲺鲻鲼鲽鲾鲿鳀鳁鳂鳃鳄鳅鳆鳇鳈鳉鳊鳋鳌鳍鳎鳏鳐鳑鳒鳓鳔鳕鳖鳗鳘鳙鳛鳜鳝鳞鳟鳠鳡鳢鳣鸟鸠鸡鸢鸣鸤鸥鸦鸧鸨鸩鸪鸫鸬鸭鸮鸯鸰鸱鸲鸳鸴鸵鸶鸷鸸鸹鸺鸻鸼鸽鸾鸿鹀鹁鹂鹃鹄鹅鹆鹇鹈鹉鹊鹋鹌鹍鹎鹏鹐鹑鹒鹓鹔鹕鹖鹗鹘鹚鹛鹜鹝鹞鹟鹠鹡鹢鹣鹤鹥鹦鹧鹨鹩鹪鹫鹬鹭鹯鹰鹱鹲鹳鹴鹾麦麸黄黉黡黩黪黾龙历志制一台皋准复猛钟注范签";
  }
  function FTPYStr() {
    return "萬與醜專業叢東絲丟兩嚴喪個爿豐臨為麗舉麼義烏樂喬習鄉書買亂爭於虧雲亙亞產畝親褻嚲億僅從侖倉儀們價眾優夥會傴傘偉傳傷倀倫傖偽佇體餘傭僉俠侶僥偵側僑儈儕儂俁儔儼倆儷儉債傾傯僂僨償儻儐儲儺兒兌兗黨蘭關興茲養獸囅內岡冊寫軍農塚馮衝決況凍淨淒涼淩減湊凜幾鳳鳧憑凱擊氹鑿芻劃劉則剛創刪別剗剄劊劌剴劑剮劍剝劇勸辦務勱動勵勁勞勢勳猛勩勻匭匱區醫華協單賣盧鹵臥衛卻巹廠廳曆厲壓厭厙廁廂厴廈廚廄廝縣參靉靆雙發變敘疊葉號歎嘰籲後嚇呂嗎唚噸聽啟吳嘸囈嘔嚦唄員咼嗆嗚詠哢嚨嚀噝吒噅鹹呱響啞噠嘵嗶噦嘩噲嚌噥喲嘜嗊嘮啢嗩唕喚呼嘖嗇囀齧囉嘽嘯噴嘍嚳囁嗬噯噓嚶囑嚕劈囂謔團園囪圍圇國圖圓聖壙場阪壞塊堅壇壢壩塢墳墜壟壟壚壘墾坰堊墊埡墶壋塏堖塒塤堝墊垵塹墮壪牆壯聲殼壺壼處備複夠頭誇夾奪奩奐奮獎奧妝婦媽嫵嫗媯姍薑婁婭嬈嬌孌娛媧嫻嫿嬰嬋嬸媼嬡嬪嬙嬤孫學孿寧寶實寵審憲宮寬賓寢對尋導壽將爾塵堯尷屍盡層屭屜屆屬屢屨嶼歲豈嶇崗峴嶴嵐島嶺嶽崠巋嶨嶧峽嶢嶠崢巒嶗崍嶮嶄嶸嶔崳嶁脊巔鞏巰幣帥師幃帳簾幟帶幀幫幬幘幗冪襆幹並廣莊慶廬廡庫應廟龐廢廎廩開異棄張彌弳彎彈強歸當錄彠彥徹徑徠禦憶懺憂愾懷態慫憮慪悵愴憐總懟懌戀懇惡慟懨愷惻惱惲悅愨懸慳憫驚懼慘懲憊愜慚憚慣湣慍憤憒願懾憖怵懣懶懍戇戔戲戧戰戩戶紮撲扡執擴捫掃揚擾撫拋摶摳掄搶護報擔擬攏揀擁攔擰撥擇掛摯攣掗撾撻挾撓擋撟掙擠揮撏撈損撿換搗據撚擄摑擲撣摻摜摣攬撳攙擱摟攪攜攝攄擺搖擯攤攖撐攆擷擼攛擻攢敵斂數齋斕鬥斬斷無舊時曠暘曇晝曨顯晉曬曉曄暈暉暫曖劄術樸機殺雜權條來楊榪傑極構樅樞棗櫪梘棖槍楓梟櫃檸檉梔柵標棧櫛櫳棟櫨櫟欄樹棲樣欒棬椏橈楨檔榿橋樺檜槳樁夢檮棶檢欞槨櫝槧欏橢樓欖櫬櫚櫸檟檻檳櫧橫檣櫻櫫櫥櫓櫞簷檁歡歟歐殲歿殤殘殞殮殫殯毆毀轂畢斃氈毿氌氣氫氬氳彙漢汙湯洶遝溝沒灃漚瀝淪滄渢溈滬濔濘淚澩瀧瀘濼瀉潑澤涇潔灑窪浹淺漿澆湞溮濁測澮濟瀏滻渾滸濃潯濜塗湧濤澇淶漣潿渦溳渙滌潤澗漲澀澱淵淥漬瀆漸澠漁瀋滲溫遊灣濕潰濺漵漊潷滾滯灩灄滿瀅濾濫灤濱灘澦濫瀠瀟瀲濰潛瀦瀾瀨瀕灝滅燈靈災燦煬爐燉煒熗點煉熾爍爛烴燭煙煩燒燁燴燙燼熱煥燜燾煆糊溜愛爺牘犛牽犧犢強狀獷獁猶狽麅獮獰獨狹獅獪猙獄猻獫獵獼玀豬貓蝟獻獺璣璵瑒瑪瑋環現瑲璽瑉玨琺瓏璫琿璡璉瑣瓊瑤璦璿瓔瓚甕甌電畫暢佘疇癤療瘧癘瘍鬁瘡瘋皰屙癰痙癢瘂癆瘓癇癡癉瘮瘞瘺癟癱癮癭癩癬癲臒皚皺皸盞鹽監蓋盜盤瞘眥矓著睜睞瞼瞞矚矯磯礬礦碭碼磚硨硯碸礪礱礫礎硜矽碩硤磽磑礄確鹼礙磧磣堿镟滾禮禕禰禎禱禍稟祿禪離禿稈種積稱穢穠穭稅穌穩穡窮竊竅窯竄窩窺竇窶豎競篤筍筆筧箋籠籩築篳篩簹箏籌簽簡籙簀篋籜籮簞簫簣簍籃籬籪籟糴類秈糶糲粵糞糧糝餱緊縶糸糾紆紅紂纖紇約級紈纊紀紉緯紜紘純紕紗綱納紝縱綸紛紙紋紡紵紖紐紓線紺絏紱練組紳細織終縐絆紼絀紹繹經紿綁絨結絝繞絰絎繪給絢絳絡絕絞統綆綃絹繡綌綏絛繼綈績緒綾緓續綺緋綽緔緄繩維綿綬繃綢綯綹綣綜綻綰綠綴緇緙緗緘緬纜緹緲緝縕繢緦綞緞緶線緱縋緩締縷編緡緣縉縛縟縝縫縗縞纏縭縊縑繽縹縵縲纓縮繆繅纈繚繕繒韁繾繰繯繳纘罌網羅罰罷羆羈羥羨翹翽翬耮耬聳恥聶聾職聹聯聵聰肅腸膚膁腎腫脹脅膽勝朧腖臚脛膠脈膾髒臍腦膿臠腳脫腡臉臘醃膕齶膩靦膃騰臏臢輿艤艦艙艫艱豔艸藝節羋薌蕪蘆蓯葦藶莧萇蒼苧蘇檾蘋莖蘢蔦塋煢繭荊薦薘莢蕘蓽蕎薈薺蕩榮葷滎犖熒蕁藎蓀蔭蕒葒葤藥蒞蓧萊蓮蒔萵薟獲蕕瑩鶯蓴蘀蘿螢營縈蕭薩蔥蕆蕢蔣蔞藍薊蘺蕷鎣驀薔蘞藺藹蘄蘊藪槁蘚虜慮虛蟲虯蟣雖蝦蠆蝕蟻螞蠶蠔蜆蠱蠣蟶蠻蟄蛺蟯螄蠐蛻蝸蠟蠅蟈蟬蠍螻蠑螿蟎蠨釁銜補襯袞襖嫋褘襪襲襏裝襠褌褳襝褲襇褸襤繈襴見觀覎規覓視覘覽覺覬覡覿覥覦覯覲覷觴觸觶讋譽謄訁計訂訃認譏訐訌討讓訕訖訓議訊記訒講諱謳詎訝訥許訛論訩訟諷設訪訣證詁訶評詛識詗詐訴診詆謅詞詘詔詖譯詒誆誄試詿詩詰詼誠誅詵話誕詬詮詭詢詣諍該詳詫諢詡譸誡誣語誚誤誥誘誨誑說誦誒請諸諏諾讀諑誹課諉諛誰諗調諂諒諄誶談誼謀諶諜謊諫諧謔謁謂諤諭諼讒諮諳諺諦謎諞諝謨讜謖謝謠謗諡謙謐謹謾謫譾謬譚譖譙讕譜譎讞譴譫讖穀豶貝貞負貟貢財責賢敗賬貨質販貪貧貶購貯貫貳賤賁貰貼貴貺貸貿費賀貽賊贄賈賄貲賃賂贓資賅贐賕賑賚賒賦賭齎贖賞賜贔賙賡賠賧賴賵贅賻賺賽賾贗讚贇贈贍贏贛赬趙趕趨趲躉躍蹌蹠躒踐躂蹺蹕躚躋踴躊蹤躓躑躡蹣躕躥躪躦軀車軋軌軒軑軔轉軛輪軟轟軲軻轤軸軹軼軤軫轢軺輕軾載輊轎輈輇輅較輒輔輛輦輩輝輥輞輬輟輜輳輻輯轀輸轡轅轄輾轆轍轔辭辯辮邊遼達遷過邁運還這進遠違連遲邇逕跡適選遜遞邐邏遺遙鄧鄺鄔郵鄒鄴鄰鬱郤郟鄶鄭鄆酈鄖鄲醞醱醬釅釃釀釋裏钜鑒鑾鏨釓釔針釘釗釙釕釷釺釧釤鈒釩釣鍆釹鍚釵鈃鈣鈈鈦鈍鈔鍾鈉鋇鋼鈑鈐鑰欽鈞鎢鉤鈧鈁鈥鈄鈕鈀鈺錢鉦鉗鈷缽鈳鉕鈽鈸鉞鑽鉬鉭鉀鈿鈾鐵鉑鈴鑠鉛鉚鈰鉉鉈鉍鈹鐸鉶銬銠鉺銪鋏鋣鐃銍鐺銅鋁銱銦鎧鍘銖銑鋌銩銛鏵銓鉿銚鉻銘錚銫鉸銥鏟銃鐋銨銀銣鑄鐒鋪鋙錸鋱鏈鏗銷鎖鋰鋥鋤鍋鋯鋨鏽銼鋝鋒鋅鋶鐦鐧銳銻鋃鋟鋦錒錆鍺錯錨錡錁錕錩錫錮鑼錘錐錦鍁錈錇錟錠鍵鋸錳錙鍥鍈鍇鏘鍶鍔鍤鍬鍾鍛鎪鍠鍰鎄鍍鎂鏤鎡鏌鎮鎛鎘鑷鐫鎳鎿鎦鎬鎊鎰鎔鏢鏜鏍鏰鏞鏡鏑鏃鏇鏐鐔钁鐐鏷鑥鐓鑭鐠鑹鏹鐙鑊鐳鐶鐲鐮鐿鑔鑣鑞鑲長門閂閃閆閈閉問闖閏闈閑閎間閔閌悶閘鬧閨聞闥閩閭闓閥閣閡閫鬮閱閬闍閾閹閶鬩閿閽閻閼闡闌闃闠闊闋闔闐闒闕闞闤隊陽陰陣階際陸隴陳陘陝隉隕險隨隱隸雋難雛讎靂霧霽黴靄靚靜靨韃鞽韉韝韋韌韍韓韙韞韜韻頁頂頃頇項順須頊頑顧頓頎頒頌頏預顱領頗頸頡頰頲頜潁熲頦頤頻頮頹頷頴穎顆題顒顎顓顏額顳顢顛顙顥纇顫顬顰顴風颺颭颮颯颶颸颼颻飀飄飆飆飛饗饜飣饑飥餳飩餼飪飫飭飯飲餞飾飽飼飿飴餌饒餉餄餎餃餏餅餑餖餓餘餒餕餜餛餡館餷饋餶餿饞饁饃餺餾饈饉饅饊饌饢馬馭馱馴馳驅馹駁驢駔駛駟駙駒騶駐駝駑駕驛駘驍罵駰驕驊駱駭駢驫驪騁驗騂駸駿騏騎騍騅騌驌驂騙騭騤騷騖驁騮騫騸驃騾驄驏驟驥驦驤髏髖髕鬢魘魎魚魛魢魷魨魯魴魺鮁鮃鯰鱸鮋鮓鮒鮊鮑鱟鮍鮐鮭鮚鮳鮪鮞鮦鰂鮜鱠鱭鮫鮮鮺鯗鱘鯁鱺鰱鰹鯉鰣鰷鯀鯊鯇鮶鯽鯒鯖鯪鯕鯫鯡鯤鯧鯝鯢鯰鯛鯨鯵鯴鯔鱝鰈鰏鱨鯷鰮鰃鰓鱷鰍鰒鰉鰁鱂鯿鰠鼇鰭鰨鰥鰩鰟鰜鰳鰾鱈鱉鰻鰵鱅鰼鱖鱔鱗鱒鱯鱤鱧鱣鳥鳩雞鳶鳴鳲鷗鴉鶬鴇鴆鴣鶇鸕鴨鴞鴦鴒鴟鴝鴛鴬鴕鷥鷙鴯鴰鵂鴴鵃鴿鸞鴻鵐鵓鸝鵑鵠鵝鵒鷳鵜鵡鵲鶓鵪鶤鵯鵬鵮鶉鶊鵷鷫鶘鶡鶚鶻鶿鶥鶩鷊鷂鶲鶹鶺鷁鶼鶴鷖鸚鷓鷚鷯鷦鷲鷸鷺鸇鷹鸌鸏鸛鸘鹺麥麩黃黌黶黷黲黽龍歷誌製壹臺臯準復勐鐘註範籤";
  }
  function Traditionalized(cc) {
    let str = "";
    const ss = JTPYStr();
    const tt = FTPYStr();
    for (let i = 0; i < cc.length; i++) {
      if (cc.charCodeAt(i) > 10000 && ss.indexOf(cc.charAt(i)) !== -1) {
        str += tt.charAt(ss.indexOf(cc.charAt(i)));
      } else str += cc.charAt(i);
    }
    return str;
  }
  function Simplized(cc) {
    let str = "";
    const ss = JTPYStr();
    const tt = FTPYStr();
    for (let i = 0; i < cc.length; i++) {
      if (cc.charCodeAt(i) > 10000 && tt.indexOf(cc.charAt(i)) !== -1) {
        str += ss.charAt(tt.indexOf(cc.charAt(i)));
      } else str += cc.charAt(i);
    }
    return str;
  }

  function translateInitialization() {
    translateButtonObject = document.getElementById("translateLink");
    translateRightMenuButtonObject = document.getElementById("menu-translate").querySelector("span");
    const translateRightMenuButtonElement = document.getElementById("menu-translate");

    if (translateButtonObject || translateRightMenuButtonObject) {
      if (currentEncoding !== targetEncoding) {
        translateButtonObject.innerHTML = targetEncoding === 1 ? msgToSimplifiedChinese : msgToTraditionalChinese;
        translateRightMenuButtonObject.innerHTML =
          targetEncoding === 1 ? rightMenuMsgToSimplifiedChinese : rightMenuMsgToTraditionalChinese;
        setLang();
        setTimeout(translateBody, translateDelay);
      }
      translateButtonObject.addEventListener("click", translatePage, false);
      translateRightMenuButtonElement.addEventListener("click", translatePage, false);
    }
  }
  translateInitialization();
  document.addEventListener("pjax:complete", translateInitialization);
});


/*! instant.page v5.2.0 - (C) 2019-2023 Alexandre Dieulot - https://instant.page/license */

let _chromiumMajorVersionInUserAgent = null
  , _allowQueryString
  , _allowExternalLinks
  , _useWhitelist
  , _delayOnHover = 65
  , _lastTouchTimestamp
  , _mouseoverTimer
  , _preloadedList = new Set()

const DELAY_TO_NOT_BE_CONSIDERED_A_TOUCH_INITIATED_ACTION = 1111

init()

function init() {
  const isSupported = document.createElement('link').relList.supports('prefetch')
  // instant.page is meant to be loaded with <script type=module>
  // (though sometimes webmasters load it as a regular script).
  // So it’s normally executed (and must not cause JavaScript errors) in:
  // - Chromium 61+
  // - Gecko in Firefox 60+
  // - WebKit in Safari 10.1+ (iOS 10.3+, macOS 10.10+)
  //
  // The check above used to check for IntersectionObserverEntry.isIntersecting
  // but module scripts support implies this compatibility — except in Safari
  // 10.1–12.0, but this prefetch check takes care of it.

  if (!isSupported) {
    return
  }

  const handleVaryAcceptHeader = 'instantVaryAccept' in document.body.dataset || 'Shopify' in window
  // The `Vary: Accept` header when received in Chromium 79–109 makes prefetches
  // unusable, as Chromium used to send a different `Accept` header.
  // It’s applied on all Shopify sites by default, as Shopify is very popular
  // and is the main source of this problem.
  // `window.Shopify` only exists on “classic” Shopify sites. Those using
  // Hydrogen (Remix SPA) aren’t concerned.

  const chromiumUserAgentIndex = navigator.userAgent.indexOf('Chrome/')
  if (chromiumUserAgentIndex > -1) {
    _chromiumMajorVersionInUserAgent = parseInt(navigator.userAgent.substring(chromiumUserAgentIndex + 'Chrome/'.length))
  }
  // The user agent client hints API is a theoretically more reliable way to
  // get Chromium’s version… but it’s not available in Samsung Internet 20.
  // It also requires a secure context, which would make debugging harder,
  // and is only available in recent Chromium versions.
  // In practice, Chromium browsers never shy from announcing "Chrome" in
  // their regular user agent string, as that maximizes their compatibility.

  if (handleVaryAcceptHeader && _chromiumMajorVersionInUserAgent && _chromiumMajorVersionInUserAgent < 110) {
    return
  }

  const mousedownShortcut = 'instantMousedownShortcut' in document.body.dataset
  _allowQueryString = 'instantAllowQueryString' in document.body.dataset
  _allowExternalLinks = 'instantAllowExternalLinks' in document.body.dataset
  _useWhitelist = 'instantWhitelist' in document.body.dataset

  const eventListenersOptions = {
    capture: true,
    passive: true,
  }

  let useMousedown = false
  let useMousedownOnly = false
  let useViewport = false
  if ('instantIntensity' in document.body.dataset) {
    const intensity = document.body.dataset.instantIntensity

    if (intensity.startsWith('mousedown')) {
      useMousedown = true
      if (intensity == 'mousedown-only') {
        useMousedownOnly = true
      }
    }
    else if (intensity.startsWith('viewport')) {
      const isNavigatorConnectionSaveDataEnabled = navigator.connection && navigator.connection.saveData
      const isNavigatorConnectionLike2g = navigator.connection && navigator.connection.effectiveType && navigator.connection.effectiveType.includes('2g')
      if (!isNavigatorConnectionSaveDataEnabled && !isNavigatorConnectionLike2g) {
        if (intensity == "viewport") {
          if (document.documentElement.clientWidth * document.documentElement.clientHeight < 450000) {
            useViewport = true
            // Smartphones are the most likely to have a slow connection, and
            // their small screen size limits the number of links (and thus
            // server load).
            //
            // Foldable phones (being expensive as of 2023), tablets and PCs
            // generally have a decent connection, and a big screen displaying
            // more links that would put more load on the server.
            //
            // iPhone 14 Pro Max (want): 430×932 = 400 760
            // Samsung Galaxy S22 Ultra with display size set to 80% (want):
            // 450×965 = 434 250
            // Small tablet (don’t want): 600×960 = 576 000
            // Those number are virtual screen size, the viewport (used for
            // the check above) will be smaller with the browser’s interface.
          }
        }
        else if (intensity == "viewport-all") {
          useViewport = true
        }
      }
    }
    else {
      const milliseconds = parseInt(intensity)
      if (!isNaN(milliseconds)) {
        _delayOnHover = milliseconds
      }
    }
  }

  if (!useMousedownOnly) {
    document.addEventListener('touchstart', touchstartListener, eventListenersOptions)
  }

  if (!useMousedown) {
    document.addEventListener('mouseover', mouseoverListener, eventListenersOptions)
  }
  else if (!mousedownShortcut) {
      document.addEventListener('mousedown', mousedownListener, eventListenersOptions)
  }

  if (mousedownShortcut) {
    document.addEventListener('mousedown', mousedownShortcutListener, eventListenersOptions)
  }

  if (useViewport) {
    let requestIdleCallbackOrFallback = window.requestIdleCallback
    // Safari has no support as of 16.3: https://webkit.org/b/164193
    if (!requestIdleCallbackOrFallback) {
      requestIdleCallbackOrFallback = (callback) => {
        callback()
        // A smarter fallback like setTimeout is not used because devices that
        // may eventually be eligible to a Safari version supporting prefetch
        // will be very powerful.
        // The weakest devices that could be eligible are the 2017 iPad and
        // the 2016 MacBook.
      }
    }

    requestIdleCallbackOrFallback(function observeIntersection() {
      const intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const anchorElement = entry.target
            intersectionObserver.unobserve(anchorElement)
            preload(anchorElement.href)
          }
        })
      })

      document.querySelectorAll('a').forEach((anchorElement) => {
        if (isPreloadable(anchorElement)) {
          intersectionObserver.observe(anchorElement)
        }
      })
    }, {
      timeout: 1500,
    })
  }
}

function touchstartListener(event) {
  _lastTouchTimestamp = performance.now()
  // Chrome on Android triggers mouseover before touchcancel, so
  // `_lastTouchTimestamp` must be assigned on touchstart to be measured
  // on mouseover.

  const anchorElement = event.target.closest('a')

  if (!isPreloadable(anchorElement)) {
    return
  }

  preload(anchorElement.href, 'high')
}

function mouseoverListener(event) {
  if (performance.now() - _lastTouchTimestamp < DELAY_TO_NOT_BE_CONSIDERED_A_TOUCH_INITIATED_ACTION) {
    return
  }

  if (!('closest' in event.target)) {
    return
    // Without this check sometimes an error “event.target.closest is not a function” is thrown, for unknown reasons
    // That error denotes that `event.target` isn’t undefined. My best guess is that it’s the Document.
    //
    // Details could be gleaned from throwing such an error:
    //throw new TypeError(`instant.page non-element event target: timeStamp=${~~event.timeStamp}, type=${event.type}, typeof=${typeof event.target}, nodeType=${event.target.nodeType}, nodeName=${event.target.nodeName}, viewport=${innerWidth}x${innerHeight}, coords=${event.clientX}x${event.clientY}, scroll=${scrollX}x${scrollY}`)
  }
  const anchorElement = event.target.closest('a')

  if (!isPreloadable(anchorElement)) {
    return
  }

  anchorElement.addEventListener('mouseout', mouseoutListener, {passive: true})

  _mouseoverTimer = setTimeout(() => {
    preload(anchorElement.href, 'high')
    _mouseoverTimer = undefined
  }, _delayOnHover)
}

function mousedownListener(event) {
  const anchorElement = event.target.closest('a')

  if (!isPreloadable(anchorElement)) {
    return
  }

  preload(anchorElement.href, 'high')
}

function mouseoutListener(event) {
  if (event.relatedTarget && event.target.closest('a') == event.relatedTarget.closest('a')) {
    return
  }

  if (_mouseoverTimer) {
    clearTimeout(_mouseoverTimer)
    _mouseoverTimer = undefined
  }
}

function mousedownShortcutListener(event) {
  if (performance.now() - _lastTouchTimestamp < DELAY_TO_NOT_BE_CONSIDERED_A_TOUCH_INITIATED_ACTION) {
    return
  }

  const anchorElement = event.target.closest('a')

  if (event.which > 1 || event.metaKey || event.ctrlKey) {
    return
  }

  if (!anchorElement) {
    return
  }

  anchorElement.addEventListener('click', function (event) {
    if (event.detail == 1337) {
      return
    }

    event.preventDefault()
  }, {capture: true, passive: false, once: true})

  const customEvent = new MouseEvent('click', {view: window, bubbles: true, cancelable: false, detail: 1337})
  anchorElement.dispatchEvent(customEvent)
}

function isPreloadable(anchorElement) {
  if (!anchorElement || !anchorElement.href) {
    return
  }

  if (_useWhitelist && !('instant' in anchorElement.dataset)) {
    return
  }

  if (anchorElement.origin != location.origin) {
    let allowed = _allowExternalLinks || 'instant' in anchorElement.dataset
    if (!allowed || !_chromiumMajorVersionInUserAgent) {
      // Chromium-only: see comment on “restrictive prefetch”
      return
    }
  }

  if (!['http:', 'https:'].includes(anchorElement.protocol)) {
    return
  }

  if (anchorElement.protocol == 'http:' && location.protocol == 'https:') {
    return
  }

  if (!_allowQueryString && anchorElement.search && !('instant' in anchorElement.dataset)) {
    return
  }

  if (anchorElement.hash && anchorElement.pathname + anchorElement.search == location.pathname + location.search) {
    return
  }

  if ('noInstant' in anchorElement.dataset) {
    return
  }

  return true
}

function preload(url, fetchPriority = 'auto') {
  if (_preloadedList.has(url)) {
    return
  }

  const linkElement = document.createElement('link')
  linkElement.rel = 'prefetch'
  linkElement.href = url

  linkElement.fetchPriority = fetchPriority
  // By default, a prefetch is loaded with a low priority.
  // When there’s a fair chance that this prefetch is going to be used in the
  // near term (= after a touch/mouse event), giving it a high priority helps
  // make the page load faster in case there are other resources loading.
  // Prioritizing it implicitly means deprioritizing every other resource
  // that’s loading on the page. Due to HTML documents usually being much
  // smaller than other resources (notably images and JavaScript), and
  // prefetches happening once the initial page is sufficiently loaded,
  // this theft of bandwidth should rarely be detrimental.

  linkElement.as = 'document'
  // as=document is Chromium-only and allows cross-origin prefetches to be
  // usable for navigation. They call it “restrictive prefetch” and intend
  // to remove it: https://crbug.com/1352371
  //
  // This document from the Chrome team dated 2022-08-10
  // https://docs.google.com/document/d/1x232KJUIwIf-k08vpNfV85sVCRHkAxldfuIA5KOqi6M
  // claims (I haven’t tested) that data- and battery-saver modes as well as
  // the setting to disable preloading do not disable restrictive prefetch,
  // unlike regular prefetch. That’s good for prefetching on a touch/mouse
  // event, but might be bad when prefetching every link in the viewport.

  document.head.appendChild(linkElement)

  _preloadedList.add(url)
}


/*!
--------------------------------
Waterfall.js
--------------------------------
+ https://github.com/raphamorim/waterfall
+ version 1.0.0
+ Copyright 2015 Raphael Amorim
+ Licensed under the MIT license
+ Documentation: https://github.com/raphamorim/waterfall
*/
function waterfall(container) {
  if (typeof container === "string") container = document.querySelector(container);

  // Freeze the list of nodes
  var els = [].map.call(container.children, function (el) {
    el.style.position = "absolute";
    return el;
  });
  container.style.position = "relative";

  function margin(name, el) {
    var style = window.getComputedStyle(el);
    return parseFloat(style["margin" + name]) || 0;
  }
  function px(n) {
    return n + "px";
  }
  function y(el) {
    return parseFloat(el.style.top);
  }
  function x(el) {
    return parseFloat(el.style.left);
  }
  function width(el) {
    return el.clientWidth;
  }
  function height(el) {
    return el.clientHeight;
  }
  function bottom(el) {
    return y(el) + height(el) + margin("Bottom", el);
  }
  function right(el) {
    return x(el) + width(el) + margin("Right", el);
  }

  function sort(l) {
    l = l.sort(function (a, b) {
      if (bottom(a) === bottom(b)) {
        return x(b) - x(a);
      } else {
        return bottom(b) - bottom(a);
      }
    });
  }

  var boundary = [];

  // Deal with the first element.
  if (els.length) {
    els[0].style.top = "0px";
    els[0].style.left = px(margin("Left", els[0]));
    boundary.push(els[0]);
  }

  // Deal with the first line.
  for (var i = 1; i < els.length; i++) {
    var prev = els[i - 1],
      el = els[i],
      thereIsSpace = right(prev) + width(el) <= width(container);
    if (!thereIsSpace) break;
    el.style.top = prev.style.top;
    el.style.left = px(right(prev) + margin("Left", el));
    boundary.push(el);
  }

  // Place following elements at the bottom of the smallest column.
  for (; i < els.length; i++) {
    sort(boundary);
    var el = els[i],
      minEl = boundary.pop();
    el.style.top = px(bottom(minEl) + margin("Top", el));
    el.style.left = px(x(minEl));
    boundary.push(el);
  }

  sort(boundary);
  var maxEl = boundary[0];
  container.style.height = px(bottom(maxEl) + margin("Bottom", maxEl));

  // Responds to window resize
  var containerWidth = width(container);
  function resize(e) {
    if (width(container) != containerWidth) {
      e.target.removeEventListener(e.type, resize);
      waterfall(container);
    }
  }

  if (window.addEventListener) {
    window.addEventListener("resize", resize);
  } else {
    document.body.onresize = resize;
  }
}

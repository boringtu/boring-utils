
/*
  * Utils: Common Scripts Library
  * @Author: BoringTu
  * @Email: work@BoringTu.com
 */

(function() {
  var hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  define(['md5', 'base64'], function(md5) {
    "use strict";
    var Queue, Stack, Utils, class2type, i, name, ref;
    class2type = [];
    ref = 'Boolean Number String Function Array Date RegExp Object Error'.split(' ');
    for (i in ref) {
      name = ref[i];
      class2type["[object " + name + "]"] = name.toLowerCase();
    }
    Utils = (function() {
      var _firstDayOfMonth, _formatDate, _lastDayOfMonth;

      function Utils() {}


      /*
      		  * 深度 clone 对象
      		  * @param obj [Object] 必填。将要 clone 的对象
       */

      Utils.prototype.clone = function(obj) {
        var o, re, val;
        if (!(typeof obj === 'object' && (obj != null))) {
          return obj;
        }
        if (obj instanceof Date) {
          re = new Date();
          re.setTime(obj.getTime());
          return re;
        }
        re = obj instanceof Array ? [] : {};
        for (o in obj) {
          if (!hasProp.call(obj, o)) continue;
          val = obj[o];
          if (typeof val === 'object') {
            re[o] = this.clone(val);
          } else {
            re[o] = val;
          }
        }
        return re;
      };

      Utils.prototype.isWindow = function(obj) {
        return (obj != null) && obj === obj.window;
      };

      Utils.prototype.type = function(obj) {
        if (obj != null) {
          if (typeof obj === 'object' || typeof obj === 'function') {
            return class2type[toString.call(obj)] || 'object';
          } else {
            return typeof obj;
          }
        } else {
          return "" + obj;
        }
      };

      Utils.prototype.isArray = Array.isArray || function(obj) {
        return 'array' === this.type(obj);
      };


      /*
      		  * 判断参数是否是一个纯粹的对象
      		  *
      		  * via: jQuery
      		  * @webSite: https://jquery.com
       */

      Utils.prototype.isPlainObject = function(obj) {
        var e, error, hasOwn, key, temp;
        if (!obj || this.type(obj) !== 'object' || obj.nodeType || this.isWindow(obj)) {
          return false;
        }
        hasOwn = {}.hasOwnProperty;
        try {
          if (obj.constructor && !hasOwn.call(obj, 'constructor') && !hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
            return false;
          }
        } catch (error) {
          e = error;
          return false;
        }
        for (key in obj) {
          temp = null;
        }
        return key === void 0 || hasOwn.call(obj, key);
      };


      /*
      		  * 扩展对象
      		  * extend [isDeep,] target, obj1[, obj2[, obj3[, ...]]]
      		  *
      		  * via: jQuery
      		  * @webSite: https://jquery.com
       */

      Utils.prototype.extend = function() {
        var clone, copy, copyIsArray, deep, length, options, src, target;
        target = arguments[0] || {};
        i = 1;
        length = arguments.length;
        deep = false;
        if (typeof target === 'boolean') {
          deep = target;
          target = arguments[i] || {};
          i++;
        }
        if (typeof target !== 'object' && !this.isFunction(target)) {
          target = {};
        }
        if (i === length) {
          target = this;
          i--;
        }
        while (i < length) {
          if ((options = arguments[i]) != null) {
            for (name in options) {
              copy = options[name];
              src = target[name];
              if (target === copy) {
                continue;
              }
              if (deep && copy && (this.isPlainObject(copy) || (copyIsArray = this.isArray(copy)))) {
                if (copyIsArray) {
                  copyIsArray = false;
                  clone = src && this.isArray(src) ? src : [];
                } else {
                  clone = src && this.isPlainObject(src) ? src : {};
                }
                target[name] = this.extend(deep, clone, copy);
              } else if (copy !== void 0) {
                target[name] = copy;
              }
            }
          }
          i++;
        }
        return target;
      };


      /*
      		  * 格式化金额
      		  * @param money [string/Number] 待精确的金额
      		  * @param precision [int] 小数点后精确位数 默认：4
      		  * e.g.: 1234567.89	=>	1,234,567.8900
       */

      Utils.prototype.formatMoney = function(money, precision) {
        var decimal, formatRound, round, temp;
        if (precision == null) {
          precision = 4;
        }
        formatRound = function(money) {
          return ("" + money).replace(/(\d+?)(?=(?:\d{3})+$)/g, '$1,');
        };
        money = money + '';
        temp = money.split('.');
        round = +temp[0];
        round = formatRound(round);
        if (!precision) {
          return round;
        }
        decimal = '' + Math.round(("." + (temp[1] || 0)) * Math.pow(10, precision));
        return (formatRound(round)) + "." + (((function() {
          var j, ref1, results;
          results = [];
          for (i = j = 0, ref1 = precision - decimal.length; 0 <= ref1 ? j < ref1 : j > ref1; i = 0 <= ref1 ? ++j : --j) {
            results.push('0');
          }
          return results;
        })()).join('')) + decimal;
      };


      /*
      		  * 获得指定日期规范格式<yyyy-MM-dd>的字符串数组
      		  * @param param [Object] 选填。JSON对象。
      		  * @param param - date [Date/String] 选填。欲格式化的Date/String类型的数据。如为空，则返回当前日期。
      		  * @param param - forward [Number] 选填。提前的天数。支持0和负整数。如果调用时带有此参数，将返回一个包含两个元素的数组，第一个日期早于第二个日期。
       */

      Utils.prototype.getDate = function(param) {
        var af_day, be_day, date;
        if (!param) {
          return;
        }
        date = param['date'] || new Date();
        if (typeof date === 'string') {
          date = new Date(date);
        }
        if (/^-?\d+$/.test(param['forward'])) {
          af_day = date.getTime();
          be_day = af_day - param['forward'] * 24 * 60 * 60 * 1000;
          af_day = date.getFormatDate(new Date(af_day));
          be_day = date.getFormatDate(new Date(be_day));
          return [be_day, af_day];
        }
      };


      /*
      		  * 获得指定日期、时间规范格式<yyyy-MM-dd>|<HH:mm:ss>|<yyyy-MM-dd HH:mm:ss>的字符串
      		  * @param param [Object] 选填。JSON对象。
      		  * @param param - date [Date] 选填。欲格式化的Date类型的数据。如为空，则默认当前日期。
      		  * @param param - hasDate [Boolean] 选填。返回的规范化字符串带有“日期”。
      		  * @param param - hasTime [Boolean] 选填。返回的规范化字符串带有“时间”。
      		  * @param param - forward [Number] 选填。提前的天数。支持0和负整数。如果调用时带有此参数，将返回一个包含两个元素的数组，第一个日期早于第二个日期。
      		  * 注：此函数是用来追加到Date prototype的，不能直接调用。
       */

      _formatDate = function(param) {
        var H, M, d, date, hD, hT, m, rD, rT, re, s, y;
        date = param['date'] || this;
        y = date.getFullYear();
        M = date.getMonth() + 1;
        M = (M + '').length > 1 ? M : '0' + M;
        d = date.getDate();
        d = (d + '').length > 1 ? d : '0' + d;
        H = date.getHours();
        H = (H + '').length > 1 ? H : '0' + H;
        m = date.getMinutes();
        m = (m + '').length > 1 ? m : '0' + m;
        s = date.getSeconds();
        s = (s + '').length > 1 ? s : '0' + s;
        hD = param.hasDate;
        hT = param.hasTime;
        rD = hD ? y + '-' + M + '-' + d : '';
        rT = hT ? H + ':' + m + ':' + s : '';
        re = "" + rD + (hD && hT ? ' ' : '') + rT;
        date = void 0;
        return re;
      };


      /*
      		  * 获得指定月份第一天的规范格式<yyyy-MM-dd>的字符串
      		  * @param date [Date/String] 必填。指定月份的Date对象或可以转换成Date对象的字符串
       */

      _firstDayOfMonth = function(date) {
        if (typeof date === 'string') {
          date = new Date(date);
        }
        return new Date(date.setDate(1));
      };


      /*
      		  * 获得指定月份最后一天的规范格式<yyyy-MM-dd>的字符串
      		  * @param date [Date/String] 必填。指定月份的Date对象或可以转换成Date对象的字符串
       */

      _lastDayOfMonth = function(date) {
        var re;
        if (typeof date === 'string') {
          date = new Date(date);
        }
        date = new Date(date.setDate(1));
        re = date.setMonth(date.getMonth() + 1) - 1 * 24 * 60 * 60 * 1000;
        return new Date(re);
      };


      /*
      		  * 获取格式化日期：2000-01-01
       */

      Date.prototype.getFormatDate = function(date) {
        if (date == null) {
          date = this;
        }
        return _formatDate.call(this, {
          date: date,
          hasDate: 1
        });
      };


      /*
      		  * 获取格式化时间：00:00:00
       */

      Date.prototype.getFormatTime = function(date) {
        if (date == null) {
          date = this;
        }
        return _formatDate.call(this, {
          date: date,
          hasTime: 1
        });
      };


      /*
      		  * 获取格式化日期+时间：2000-01-01 00:00:00
       */

      Date.prototype.getFormatDateAndTime = function(date) {
        if (date == null) {
          date = this;
        }
        return _formatDate.call(this, {
          date: date,
          hasDate: 1,
          hasTime: 1
        });
      };


      /*
      		  * 获取指定月份第一天的格式化日期：2000-01-01
      		  * @param date [Date/String]
       */

      Date.prototype.firstDayOfMonth = function(date) {
        if (date == null) {
          date = this;
        }
        return _firstDayOfMonth.call(this, date);
      };


      /*
      		  * 获取指定月份最后一天的格式化日期：2000-01-31
      		  * @param date [Date/String]
       */

      Date.prototype.lastDayOfMonth = function(date) {
        if (date == null) {
          date = this;
        }
        return _lastDayOfMonth.call(this, date);
      };


      /*
      		  * 获取 n 天前的日期（n 可为负）
       */

      Date.prototype.beforeDays = function(n, date) {
        if (date == null) {
          date = this;
        }
        return new Date(date.getTime() - n * 1000 * 60 * 60 * 24);
      };


      /*
      		  * 获取 n 天后的日期（n 可为负）
       */

      Date.prototype.afterDays = function(n, date) {
        if (date == null) {
          date = this;
        }
        return new Date(date.getTime() + n * 1000 * 60 * 60 * 24);
      };


      /*
      		  * 获取 n 个月前的日期（n 可为负）
       */

      Date.prototype.beforeMonths = function(n, date) {
        if (date == null) {
          date = this;
        }
        return new Date(date.setMonth(date.getMonth() - n));
      };


      /*
      		  * 获取 n 天后的日期（n 可为负）
       */

      Date.prototype.afterMonths = function(n, date) {
        if (date == null) {
          date = this;
        }
        return new Date(date.setMonth(date.getMonth() + n));
      };


      /*
      		  * 去空格 - 前后空格都去掉
       */

      String.prototype.trim = function() {
        return this.replace(/(^\s*)|(\s*$)/g, '');
      };


      /*
      		  * 去空格 - 去前面的空格
       */

      String.prototype.trimPre = function() {
        return this.replace(/(^\s*)/g, '');
      };


      /*
      		  * 去空格 - 去后面的空格
       */

      String.prototype.trimSuf = function() {
        return this.replace(/(\s*$)/g, '');
      };


      /*
      		  * 处理JSON库
       */

      String.prototype.toJSON = function() {
        return JSON.parse(this);
      };


      /*
      		  * 将 $、<、>、"、'，与 / 转义成 HTML 字符
       */

      String.prototype.encodeHTML = function(onlyEncodeScript) {
        var encodeHTMLRules, matchHTML, str;
        if (!this) {
          return this;
        }
        encodeHTMLRules = {
          "&": "&#38;",
          "<": "&#60;",
          ">": "&#62;",
          '"': '&#34;',
          "'": '&#39;',
          "/": '&#47;'
        };
        if (onlyEncodeScript) {
          matchHTML = /<\/?\s*(script|iframe)[\s\S]*?>/gi;
          str = this.replace(matchHTML, function(m) {
            var s;
            switch (true) {
              case /script/i.test(m):
                s = 'script';
                break;
              case /iframe/i.test(m):
                s = 'iframe';
                break;
              default:
                s = '';
            }
            return "" + encodeHTMLRules['<'] + (-1 === m.indexOf('/') ? '' : encodeHTMLRules['/']) + s + encodeHTMLRules['>'];
          });
          return str.replace(/on[\w]+\s*=/gi, '');
        } else {
          matchHTML = /&(?!#?\w+;)|<|>|"|'|\//g;
          return this.replace(matchHTML, function(m) {
            return encodeHTMLRules[m] || m;
          });
        }
      };


      /*
      		  * 将 $、<、>、"、'，与 / 从 HTML 字符 反转义成正常字符
       */

      String.prototype.decodeHTML = String.prototype.decodeHTML || function() {
        var decodeHTMLRules, matchHTML;
        decodeHTMLRules = {
          "&#38;": "&",
          "&#60;": "<",
          "&#62;": ">",
          '&#34;': '"',
          '&#39;': "'",
          '&#47;': "/"
        };
        matchHTML = /&#38;|&#60;|&#62;|&#34;|&#39;|&#47;/g;
        if (this) {
          return this.replace(matchHTML, function(m) {
            return decodeHTMLRules[m] || m;
          });
        } else {
          return this;
        }
      };

      String.prototype.utf16to8 = function() {
        var c, j, len, out, ref1;
        out = '';
        len = this.length;
        for (i = j = 0, ref1 = len; 0 <= ref1 ? j < ref1 : j > ref1; i = 0 <= ref1 ? ++j : --j) {
          c = this.charCodeAt(i);
          if (c >= 0x0001 && c <= 0x007F) {
            out += this.charAt(i);
          } else if (c > 0x07FF) {
            out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
            out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
            out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
          } else {
            out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
            out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
          }
        }
        return out;
      };

      String.prototype.checkLuhn = function() {
        var count, j, len, n, num, ref1, sum;
        num = this.split('');
        len = num.length;
        sum = 0;
        for (i = j = 0, ref1 = len; 0 <= ref1 ? j < ref1 : j > ref1; i = 0 <= ref1 ? ++j : --j) {
          count = i + 1;
          n = +num[len - 1 - i];
          if (count % 2 === 0) {
            n = n * 2;
            if (!(n < 10)) {
              n = n - 9;
            }
          }
          sum += n;
        }
        return sum % 10 === 0;
      };


      /*
      		  * Array: 判断当前 array 中是否存在指定元素
       */

      Array.prototype.has = function(obj) {
        return this.indexOf(obj) !== -1;
      };


      /*
      		  * Array: 获取最后一个元素
       */

      Array.prototype.last = function() {
        return this[this.length - 1];
      };


      /*
      		  * Array: 去重
      		  * @param bool [Boolean] 是否返回移除的元素array 默认false
       */

      Array.prototype.unique = function(bool) {
        var hash, j, k, len1, len2, obj, re, result;
        if (bool == null) {
          bool = false;
        }
        result = [];
        re = [];
        hash = {};
        if (bool) {
          for (j = 0, len1 = this.length; j < len1; j++) {
            obj = this[j];
            if (hash[obj]) {
              re.push(obj);
            } else {
              result.push(obj);
              hash[obj] = true;
            }
          }
          return [result, re];
        } else {
          for (k = 0, len2 = this.length; k < len2; k++) {
            obj = this[k];
            if (!hash[obj]) {
              result.push(obj);
              hash[obj] = true;
            }
          }
          return result;
        }

        /*
        			 * 大数据量时，splice会比较低效，可以换一种方式
        			 *
        			hash = {}
        			i	 = 0
        			temp = @[0]
        			while temp
        				if hash[temp]
        					@splice i--, 1
        				else
        					hash[temp] = true
        
        				temp = @[++i]
        			@
         */
      };


      /*
      		 * Array: 移除参数中的元素
       */

      Array.prototype.remove = function(obj) {
        i = this.indexOf(obj);
        if (i === -1) {
          return null;
        }
        return this.splice(i, 1)[0];
      };


      /*
      		  * 处理Base64库
       */

      if (Object.defineProperty) {
        Base64.extendString();
      } else {
        String.prototype.toBase64 = function(urisafe) {
          return Base64[urisafe ? 'encodeURI' : 'encode'](this);
        };
        String.prototype.toBase64URI = function() {
          return Base64['encodeURI'](this);
        };
        String.prototype.fromBase64 = function() {
          return Base64['decode'](this);
        };
      }


      /*
      		 * 处理md5库
       */

      String.prototype.md5 = function() {
        return md5.apply(null, [this].concat([].slice.apply(arguments)));
      };


      /*
      		 * 精确小数点位数
      		 * @param count [int] 精确小数点后位数
      		 * @param round [Boolean] 是否四舍五入（默认：yes）
       */

      Number.prototype.accurate = function(count, round) {
        var j, k, len, num, re, ref1, ref2, str, temp, txt, x;
        if (round == null) {
          round = true;
        }
        if (this.valueOf() === 0) {
          if (count === 0) {
            return '0';
          }
          re = '0.';
          for (x = j = 0, ref1 = count; 0 <= ref1 ? j < ref1 : j > ref1; x = 0 <= ref1 ? ++j : --j) {
            re += '0';
          }
          return re;
        }
        temp = Math.pow(10, count);
        num = Math[round ? 'round' : 'floor'](this * temp);
        num = num / temp;
        str = num.toString();
        len = count - str.replace(/^\d+\.*/, '').length;
        txt = str;
        if (len) {
          txt += (num % 1 === 0 ? '.' : '');
        }
        for (i = k = 0, ref2 = len; 0 <= ref2 ? k < ref2 : k > ref2; i = 0 <= ref2 ? ++k : --k) {
          txt += '0';
        }
        return txt;
      };


      /*
      		 * 判断当前数字是否是质数
       */

      Number.prototype.isPrime = function() {
        var j, ref1;
        if (this === 0 || this === 1) {
          throw "The " + this + " is neither a prime number nor a composite number.";
        }
        if (this % 1) {
          throw 'The Number which to check is a composite number or not must be a natural number.';
        }
        if (this < 4) {
          return true;
        }
        for (i = j = 2, ref1 = Math.sqrt(this); 2 <= ref1 ? j <= ref1 : j >= ref1; i = 2 <= ref1 ? ++j : --j) {
          if (!(this % i)) {
            return false;
          }
        }
        return true;
      };


      /*
      		 * 阶乘 num!
      		 * @param num [int] 操作数
       */

      Math.factorial = function(num) {
        var formula;
        if (num !== Math.abs(num)) {
          throw 'The number to calculate for factorial must be a positive integer.';
        }
        if (num % 1 !== 0) {
          throw 'The number to calculate for factorial must be a int number.';
        }
        if (num === 0) {
          return 1;
        }
        formula = function(num, total) {
          if (num === 1) {
            return total;
          }
          return formula(num - 1, num * total);
        };
        return formula(num, 1);
      };


      /*
      		 * 排列(Arrangement)
      		 * A(n,m)
      		 * @param n [int] 元素的总个数
      		 * @param m [int] 参与选择的元素个数
       */

      Math.arrangement = function(n, m) {
        var a, b;
        if (n < m) {
          return 0;
        }
        a = Math.factorial(n);
        b = Math.factorial(n - m);
        return a / b;
      };


      /*
      		 * 组合(Combination)
      		 * C(n,m)
      		 * @param n [int] 元素的总个数
      		 * @param m [int] 参与选择的元素个数
       */

      Math.combination = function(n, m) {
        var a, b;
        if (n < m) {
          return 0;
        }
        a = Math.arrangement(n, m);
        b = Math.factorial(m);
        return a / b;
      };


      /*
      		 * int 随机数
      		 * @param min [int] 随机范围的最小数字
      		 * @param max [int] 随机范围的最大数字
       */

      Math.intRange = function(min, max) {
        if (min == null) {
          min = 0;
        }
        if (max == null) {
          max = 0;
        }
        return min + Math.round(Math.random() * (max - 1));
      };


      /*
      		 * 交集(Intersection)
       */

      Array.intersection = function(a, b) {
        var j, len1, re, ref1, x;
        re = [];
        ref1 = a.unique();
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          x = ref1[j];
          if (indexOf.call(b, x) >= 0) {
            re.push(x);
          }
        }
        return re;
      };


      /*
      		 * 并集(Union)
       */

      Array.union = function() {
        var arr, j, len1, re;
        re = [];
        for (j = 0, len1 = arguments.length; j < len1; j++) {
          arr = arguments[j];
          re = re.concat(arr);
        }
        return re.unique();
      };

      return Utils;

    })();

    /*
    	  * 栈
     */
    Stack = (function() {
      function Stack() {
        this.dataStore = [];
      }

      Stack.prototype.top = 0;

      Stack.prototype.push = function(element) {
        return this.dataStore[this.top++] = element;
      };

      Stack.prototype.pop = function() {
        return this.dataStore[--this.top];
      };

      Stack.prototype.peek = function() {
        return this.dataStore[this.top - 1];
      };

      Stack.prototype.clear = function() {
        return this.top = 0;
      };

      Stack.prototype.clone = function() {
        var obj;
        obj = new Stack();
        obj.dataStore = SMG.utils.clone(this.dataStore);
        obj.top = this.top;
        return obj;
      };

      return Stack;

    })();
    Object.defineProperties(Stack.prototype, {
      length: {
        get: function() {
          return this.top;
        }
      }
    });
    window.Stack = Stack;

    /*
    	  * 队列
     */
    Queue = (function() {
      function Queue() {
        this.dataStore = [];
      }

      Queue.prototype.enqueue = function(element) {
        return this.dataStore.push(element);
      };

      Queue.prototype.dequeue = function() {
        return this.dataStore.shift();
      };

      Queue.prototype.first = function() {
        return this.dataStore[0];
      };

      Queue.prototype.end = function() {
        return this.dataStore[this.length - 1];
      };

      Queue.prototype.clear = function() {
        return this.dataStore = [];
      };

      Queue.prototype.toString = function() {
        var el, j, len1, ref1, str;
        str = '';
        ref1 = this.dataStore;
        for (i = j = 0, len1 = ref1.length; j < len1; i = ++j) {
          el = ref1[i];
          str += "" + el + (i + 1 !== this.length ? '\n' : '');
        }
        return str;
      };

      return Queue;

    })();
    Object.defineProperties(Queue.prototype, {
      length: {
        get: function() {
          return this.dataStore.length;
        }
      }
    });
    window.Queue = Queue;
    return Utils;
  });

}).call(this);

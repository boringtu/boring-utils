###
 # Utils: Common Scripts Library
 # @Author: BoringTu
 # @Email: work@BoringTu.com
###
define ['md5', 'base64'], (md5) ->
	"use strict"
	# Populate the class2type map
	class2type	= []
	for i, name of 'Boolean Number String Function Array Date RegExp Object Error'.split ' '
		class2type[ "[object #{ name }]" ] = name.toLowerCase()

	class Utils
		###
		 # 深度 clone 对象
		 # @param obj [Object] 必填。将要 clone 的对象
		###
		clone: (obj) ->
			return obj unless typeof obj is 'object' and obj?
			if obj instanceof Date
				re	= new Date()
				re.setTime obj.getTime()
				return re
			re	= if obj instanceof Array then [] else {}
			for own o, val of obj
				if typeof val is 'object'
					re[o]	= @clone val
				else
					re[o]	= val
			re

		isWindow: (obj) ->
			obj? and obj is obj.window

		type: (obj) ->
			if obj?
				if typeof obj is 'object' or typeof obj is 'function' then class2type[toString.call obj] or 'object' else typeof obj
			else
				"#{ obj }"

		isArray: Array.isArray or (obj) -> 'array' is @type obj

		###
		 # 判断参数是否是一个纯粹的对象
		 #
		 # via: jQuery
		 # @webSite: https://jquery.com
		###
		isPlainObject: (obj) ->

			# Must be an Object.
			# Because of IE, we also have to check the presence of the constructor property.
			# Make sure that DOM nodes and window objects don't pass through, as well
			return false if !obj or @type(obj) isnt 'object' or obj.nodeType or @isWindow obj

			hasOwn	= ({}).hasOwnProperty

			try
				# Not own constructor property must be Object
				return false if obj.constructor and !hasOwn.call(obj, 'constructor') and !hasOwn.call obj.constructor.prototype, 'isPrototypeOf'
			catch e
				# IE8,9 Will throw exceptions on certain host objects #9897
				return false

			temp = null for key of obj

			key is undefined or hasOwn.call obj, key

		###
		 # 扩展对象
		 # extend [isDeep,] target, obj1[, obj2[, obj3[, ...]]]
		 #
		 # via: jQuery
		 # @webSite: https://jquery.com
		###
		extend: ->
			#var src, copyIsArray, copy, name, options, clone,
			target = arguments[0] or {}
			i = 1
			length = arguments.length
			deep = false

			# Handle a deep copy situation
			if typeof target is 'boolean'
				deep = target

				# skip the boolean and the target
				target = arguments[i] or {}
				i++

			# Handle case when target is a string or something (possible in deep copy)
			if typeof target isnt 'object' and not @isFunction target
				target = {}

			# extend jQuery itself if only one argument is passed
			if i is length
				target = @
				i--

			while i < length
				# Only deal with non-null/undefined values
				# TODO 看下转的对不对
				#if ( (options = arguments[ i ]) != null ) {
				if (options = arguments[ i ])?
					# Extend the base object
					for name, copy of options
						src = target[ name ]

						# Prevent never-ending loop
						continue if target is copy

						# Recurse if we're merging plain objects or arrays
						
						if deep and copy and ( @isPlainObject(copy) or copyIsArray = @isArray copy )
							if copyIsArray
								copyIsArray = false
								clone = if src and @isArray src then src else []

							else
								clone = if src and @isPlainObject src then src else {}

							# Never move original objects, clone them
							target[ name ] = @extend deep, clone, copy

						# Don't bring in undefined values
						else if copy isnt undefined
							target[ name ] = copy
				i++

			# Return the modified object
			target

		###
		 # 格式化金额
		 # @param money [string/Number] 待精确的金额
		 # @param precision [int] 小数点后精确位数 默认：4
		 # e.g.: 1234567.89	=>	1,234,567.8900
		###
		formatMoney: (money, precision = 4) ->
			formatRound	= (money) -> "#{ money }".replace /(\d+?)(?=(?:\d{3})+$)/g, '$1,'
			money		= money + ''
			temp		= money.split '.'
			round		= +temp[0]
			round		= formatRound round
			return round unless precision
			decimal		= '' + Math.round ".#{ temp[1] or 0 }" * Math.pow 10, precision
			"#{ formatRound round }.#{ ('0' for i in [0...precision - decimal.length]).join '' }#{ decimal }"

		###
		 # 获得指定日期规范格式<yyyy-MM-dd>的字符串数组
		 # @param param [Object] 选填。JSON对象。
		 # @param param - date [Date/String] 选填。欲格式化的Date/String类型的数据。如为空，则返回当前日期。
		 # @param param - forward [Number] 选填。提前的天数。支持0和负整数。如果调用时带有此参数，将返回一个包含两个元素的数组，第一个日期早于第二个日期。
		###
		getDate: (param) ->
			return if not param
			date = param['date'] or new Date()
			date = new Date(date) if typeof date is 'string'

			if /^-?\d+$/.test param['forward']	# forward为整数时（包括0和正负整数）
				af_day = date.getTime()
				be_day = af_day - param['forward'] * 24 * 60 * 60 * 1000
				af_day = date.getFormatDate new Date(af_day)
				be_day = date.getFormatDate new Date(be_day)

				return [be_day, af_day]
			return

		#****************************** 内部函数 ******************************#

		###
		 # 获得指定日期、时间规范格式<yyyy-MM-dd>|<HH:mm:ss>|<yyyy-MM-dd HH:mm:ss>的字符串
		 # @param param [Object] 选填。JSON对象。
		 # @param param - date [Date] 选填。欲格式化的Date类型的数据。如为空，则默认当前日期。
		 # @param param - hasDate [Boolean] 选填。返回的规范化字符串带有“日期”。
		 # @param param - hasTime [Boolean] 选填。返回的规范化字符串带有“时间”。
		 # @param param - forward [Number] 选填。提前的天数。支持0和负整数。如果调用时带有此参数，将返回一个包含两个元素的数组，第一个日期早于第二个日期。
		 # 注：此函数是用来追加到Date prototype的，不能直接调用。
		###
		_formatDate = (param) ->
			date = param['date'] or @
			y	 = date.getFullYear()
			M	 = date.getMonth() + 1
			M	 = if (M + '').length > 1 then M else '0' + M
			d	 = date.getDate()
			d	 = if (d + '').length > 1 then d else '0' + d
			H	 = date.getHours()
			H	 = if (H + '').length > 1 then H else '0' + H
			m	 = date.getMinutes()
			m	 = if (m + '').length > 1 then m else '0' + m
			s	 = date.getSeconds()
			s	 = if (s + '').length > 1 then s else '0' + s
			hD	 = param.hasDate
			hT	 = param.hasTime
			rD	 = if hD then (y + '-' + M + '-' + d) else ''
			rT	 = if hT then (H + ':' + m + ':' + s) else ''
			re	 = "#{ rD }#{ if hD and hT then ' ' else '' }#{ rT }"
			date = undefined
			re
	
		###
		 # 获得指定月份第一天的规范格式<yyyy-MM-dd>的字符串
		 # @param date [Date/String] 必填。指定月份的Date对象或可以转换成Date对象的字符串
		###
		_firstDayOfMonth = (date) ->
			date = new Date date if typeof date is 'string'
			new Date date.setDate(1)
			
		###
		 # 获得指定月份最后一天的规范格式<yyyy-MM-dd>的字符串
		 # @param date [Date/String] 必填。指定月份的Date对象或可以转换成Date对象的字符串
		###
		_lastDayOfMonth = (date) ->
			date = new Date date if typeof date is 'string'
			date = new Date date.setDate(1)
			re	 = date.setMonth(date.getMonth() + 1) - 1 * 24 * 60 * 60 * 1000
			new Date re

		#****************************** 修改原型 ******************************#

		###
		 # 获取格式化日期：2000-01-01
		###
		Date::getFormatDate = (date = @) ->
			_formatDate.call @, {date: date, hasDate: 1}

		###
		 # 获取格式化时间：00:00:00
		###
		Date::getFormatTime = (date = @) ->
			_formatDate.call @, {date: date, hasTime: 1}

		###
		 # 获取格式化日期+时间：2000-01-01 00:00:00
		###
		Date::getFormatDateAndTime = (date = @) ->
			_formatDate.call @, {date: date, hasDate: 1, hasTime: 1}

		###
		 # 获取指定月份第一天的格式化日期：2000-01-01
		 # @param date [Date/String]
		###
		Date::firstDayOfMonth = (date = @) ->
			_firstDayOfMonth.call @, date

		###
		 # 获取指定月份最后一天的格式化日期：2000-01-31
		 # @param date [Date/String]
		###
		Date::lastDayOfMonth = (date = @) ->
			_lastDayOfMonth.call @, date

		###
		 # 获取 n 天前的日期（n 可为负）
		###
		Date::beforeDays = (n, date = @) ->
			new Date date.getTime() - n * 1000 * 60 * 60 * 24

		###
		 # 获取 n 天后的日期（n 可为负）
		###
		Date::afterDays = (n, date = @) ->
			new Date date.getTime() + n * 1000 * 60 * 60 * 24

		###
		 # 获取 n 个月前的日期（n 可为负）
		###
		Date::beforeMonths = (n, date = @) ->
			new Date date.setMonth date.getMonth() - n

		###
		 # 获取 n 天后的日期（n 可为负）
		###
		Date::afterMonths = (n, date = @) ->
			new Date date.setMonth date.getMonth() + n

		###
		 # 去空格 - 前后空格都去掉
		###
		String::trim = -> @replace /(^\s*)|(\s*$)/g, ''

		###
		 # 去空格 - 去前面的空格
		###
		String::trimPre = -> @replace /(^\s*)/g, ''

		###
		 # 去空格 - 去后面的空格
		###
		String::trimSuf = -> @replace /(\s*$)/g, ''

		###
		 # 处理JSON库
		###
		String::toJSON = -> JSON.parse @

		###
		 # 将 $、<、>、"、'，与 / 转义成 HTML 字符
		###
		String::encodeHTML = (onlyEncodeScript) ->
			return @ unless @
			encodeHTMLRules =
				"&": "&#38;"
				"<": "&#60;"
				">": "&#62;"
				'"': '&#34;'
				"'": '&#39;'
				"/": '&#47;'
			if onlyEncodeScript
				matchHTML = /<\/?\s*(script|iframe)[\s\S]*?>/gi
				str	= @replace matchHTML, (m) ->
					switch true
						when /script/i.test m
							s	= 'script'
						when /iframe/i.test m
							s	= 'iframe'
						else
							s	= ''
					"#{ encodeHTMLRules['<'] }#{ if -1 is m.indexOf '/' then '' else encodeHTMLRules['/'] }#{ s }#{ encodeHTMLRules['>'] }"
				return str.replace /on[\w]+\s*=/gi, ''
			else
				matchHTML = /&(?!#?\w+;)|<|>|"|'|\//g
				return @replace matchHTML, (m) -> encodeHTMLRules[m] or m

		###
		 # 将 $、<、>、"、'，与 / 从 HTML 字符 反转义成正常字符
		###
		String::decodeHTML = String::decodeHTML or ->
			decodeHTMLRules =
				"&#38;": "&"
				"&#60;": "<"
				"&#62;": ">"
				'&#34;': '"'
				'&#39;': "'"
				'&#47;': "/"
			matchHTML = /&#38;|&#60;|&#62;|&#34;|&#39;|&#47;/g
			if @ then @replace(matchHTML, (m) -> decodeHTMLRules[m] or m) else @

		String::utf16to8 = ->
			out = ''
			len = @length
			for i in [0...len]
				c = @charCodeAt(i)
				if c >= 0x0001 and c <= 0x007F
					out += @charAt(i)
				else if c > 0x07FF
					out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F))
					out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F))
					out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F))
				else
					out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F))
					out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F))
			out

		# 验证 Luhn 算法 return true / false
		String::checkLuhn = ->
			num	= @split ''
			len	= num.length
			sum	= 0
			for i in [0...len]
				count	= i + 1
				n		= +num[len - 1 - i]
				if count % 2 is 0
					# 从最后一位数字开始，偶数位
					n	= n * 2
					n	= n - 9 unless n < 10
				sum	+= n
			return sum % 10 is 0


		###
		 # Array: 判断当前 array 中是否存在指定元素
		###
		Array::has = (obj) -> @indexOf(obj) isnt -1

		###
		 # Array: 获取最后一个元素
		###
		Array::last = -> @[@length - 1]

		###
		 # Array: 去重
		 # @param bool [Boolean] 是否返回移除的元素array 默认false
		###
		Array::unique = (bool = false) ->
			# 将被替换的结果array
			result	= []
			# 返回的移除元素array
			re		= []
			# 用于查询查询是否重复的hash map
			hash	= {}
			if bool
				for obj in @
					if hash[obj]
						re.push obj
					else
						result.push obj
						hash[obj]	= true
				return [result, re]
			else
				for obj in @
					unless hash[obj]
						result.push obj
						hash[obj]	= true
				return result
			###
			# 大数据量时，splice会比较低效，可以换一种方式
			#
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
			###

		###
		# Array: 移除参数中的元素
		###
		Array::remove = (obj) ->
			i	= @.indexOf obj
			return null if i is -1
			return @.splice(i, 1)[0]

		###
		 # 处理Base64库
		###
		if Object.defineProperty
			Base64.extendString()
		else
			String::toBase64 = (urisafe) ->
				Base64[if urisafe then 'encodeURI' else 'encode'] @
			String::toBase64URI = ->
				Base64['encodeURI'] @
			String::fromBase64 = ->
				Base64['decode'] @


		###
		# 处理md5库
		###
		String::md5 = -> md5.apply null, [@].concat [].slice.apply arguments

		###
		# 精确小数点位数
		# @param count [int] 精确小数点后位数
		# @param round [Boolean] 是否四舍五入（默认：yes）
		###
		Number::accurate = (count, round = yes) ->
			if @.valueOf() is 0
				return '0' if count is 0
				re	= '0.'
				re	+= '0' for x in [0...count]
				return re
			temp	= Math.pow 10, count
			num		= Math[if round then 'round' else 'floor'] @ * temp
			num		= num / temp
			str		= num.toString()
			len		= count - str.replace(/^\d+\.*/, '').length

			txt		= str
			txt		+= (if num % 1 is 0 then '.' else '') if len
			txt		+= '0' for i in [0...len]
			return txt

		###
		# 判断当前数字是否是质数
		###
		Number::isPrime = ->
			throw "The #{ @ } is neither a prime number nor a composite number." if @ in [0, 1]
			throw 'The Number which to check is a composite number or not must be a natural number.' if @ % 1
			return yes if @ < 4
			for i in [2..Math.sqrt @]
				return no unless @ % i
			return yes

		###
		# 阶乘 num!
		# @param num [int] 操作数
		###
		Math.factorial = (num) ->
			throw 'The number to calculate for factorial must be a positive integer.' unless num is Math.abs num
			throw 'The number to calculate for factorial must be a int number.' unless num % 1 is 0
			return 1 if num is 0
			formula = (num, total) ->
				return total if num is 1
				return formula num - 1, num * total
			formula num, 1

		###
		# 排列(Arrangement)
		# A(n,m)
		# @param n [int] 元素的总个数
		# @param m [int] 参与选择的元素个数
		###
		Math.arrangement = (n, m) ->
			return 0 if n < m
			a	= Math.factorial n
			b	= Math.factorial n - m
			a / b

		###
		# 组合(Combination)
		# C(n,m)
		# @param n [int] 元素的总个数
		# @param m [int] 参与选择的元素个数
		###
		Math.combination = (n, m) ->
			return 0 if n < m
			a	= Math.arrangement n, m
			b	= Math.factorial m
			a / b

		###
		# int 随机数
		# @param min [int] 随机范围的最小数字
		# @param max [int] 随机范围的最大数字
		###
		Math.intRange = (min = 0, max = 0) ->
			min + Math.round Math.random() * (max - 1)

		###
		# 交集(Intersection)
		###
		Array.intersection = (a, b) ->
			re	= []
			for x in a.unique()
				re.push x if x in b
			re

		###
		# 并集(Union)
		###
		Array.union = ->
			re	= []
			for arr in arguments
				re	= re.concat arr
			re.unique()

	
	###
	 # 栈
	###
	class Stack
		constructor: ->
			@dataStore	= []
		top: 0
		push: (element) -> @dataStore[@top++] = element
		pop: -> @dataStore[--@top]
		peek: -> @dataStore[@top - 1]
		clear: -> @top = 0
		clone: ->
			obj	= new Stack()
			obj.dataStore	= SMG.utils.clone @dataStore
			obj.top	= @top
			obj

	Object.defineProperties Stack::,
		length:
			get: -> @top

	window.Stack = Stack

	###
	 # 队列
	###
	class Queue
		constructor: ->
			@dataStore	= []
		enqueue: (element) -> @dataStore.push element
		dequeue: -> @dataStore.shift()
		first: -> @dataStore[0]
		end: -> @dataStore[@length - 1]
		clear: -> @dataStore = []
		toString: ->
			str = ''
			str += "#{ el }#{ if i + 1 isnt @length then '\n' else '' }" for el, i in @dataStore
			str

	Object.defineProperties Queue::,
		length:
			get: -> @dataStore.length

	window.Queue = Queue

	Utils

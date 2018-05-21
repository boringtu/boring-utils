module.exports = (grunt) ->
	pkg = grunt.file.readJSON 'package.json'
	md5 = require 'md5'
	path =
		root:		'./'
		assets:		'./assets/'
		sourceMap:	'./sourceMap/'
		src:
			coffee:		'./src/coffee/'
			js:			'./src/js/'
			css:		'./src/css/'
			template:	'./src/templates/'
			font:		'./src/fonts/'
			image:		'./src/images/'
			page:		'./src/pages/'
		dist:
			js:			'./dist/js/'
			css:		'./dist/css/'
			template:	'./dist/templates/'
			font:		'./dist/fonts/'
			image:		'./dist/images/'

	grunt.initConfig
		pkg: pkg
		watch:
			options:
				dateFormat: (time) ->
					grunt.log.writeln "The watch finished in #{ time }ms at#{ new Date().toString() }"
					grunt.log.writeln 'Waiting for more changes...'
			forCoffee:
				files: [
					"#{ path.src.coffee }**/*.coffee"
				]
				tasks: ['newer:coffee']

		bowercopy:
			options:
				clean: false
			assets:
				options:
					destPrefix: 'assets'
				files: '<%= pkg.bower.copyfiles %>'
		clean:
			dist:
				src: ['./dist/']
			forBower:
				src: '<%= pkg.bower.removefiles %>'
			assets:
				src: ['./assets/']
			css:
				src: ['./dist/css/']
			js:
				src: ['./dist/js/']
			tempJs:
				src: ['./dist/js/temp/']

		uglify:
			options:
				preserveComments: 'some'
			prd:
				files: [
					expand: true
					cwd: "#{ path.src.js }"
					src: ['**/*.js']
					dest: "#{ path.dist.js }"
				]

			forBower:
				files: '<%= pkg.bower.uglifyfiles %>'

		copy:
			forFonts:
				files: [
					expand: true
					cwd: "#{ path.src.css }"
					src: ['fonts/**']
					dest: "#{ path.dist.css }"
				]

		cssmin:
			forBower:
				files: '<%= pkg.bower.cssminfiles %>'
			prd:
				files: [
					expand: true
					cwd: "#{ path.src.css }"
					src: ['*.css']
					dest: "#{ path.dist.css }"
				]

		autoprefixer:
			css:
				src: [
					"#{ path.dist.css }*.css"
				]
		
		coffee:
			options:
				sourceMap: false
			normal:
				files: [
					expand: true
					cwd: "#{ path.src.coffee }"
					src: ['**/*.coffee']
					dest: "#{ path.src.js }"
					ext: '.js'
				]


	# 任务加载
	require('load-grunt-tasks') grunt, scope: 'devDependencies'

	grunt.registerTask 'x-assets', [
		'clean:assets'
		'bowercopy'
		'uglify:forBower'
		'cssmin:forBower'
		'clean:forBower'
	]

	grunt.registerTask 'default', [
		'clean:dist'
		'x-assets'
		'clean:js'
		'coffee'
		'uglify:prd'
		'watch'
	]

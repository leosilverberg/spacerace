module.exports = function(grunt){
	
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		watch:{
			files:['public/**', 'join/**', 'index.js', 'spaceracegame.js'],
			tasks:''
		},
		express:{
			all:{
				options:{
					port:8080,
					hostname:'localhost',
					bases:['index.js'],
					livereaload:true
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-express');	
	grunt.registerTask('server',['express','watch']);
}
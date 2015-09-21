var path = require('path');
var fs = require('fs');

var TaskRunner = {
  init: function (grunt) {
    this.loadNPM(grunt);
    this.register(grunt);
    return this.getGruntConfig(grunt);
  },
  loadNPM: function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.loadNpmTasks('grunt-shell-spawn');
  },
  getGruntConfig: function (grunt) {
  	var directory = grunt.option('project');

    return {
    	shell: {
    		getReleaseBranch: {
				command: 'git checkout release',
				options: {
					execOptions: {
						cwd: './'
					}
				}
			}
    	}
    };
  },
  registerCustomTasks:{

  },
  register: function (grunt) {
    grunt.registerTask('release', ['shell:getReleaseBranch']);
  }

}
module.exports = TaskRunner.init.bind(TaskRunner);

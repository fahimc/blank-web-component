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
        },
        fetchTags: {
          command: 'git fetch --tags origin release',
          options: {
            execOptions: {
              cwd: './'
            }
          }
        },
        getLatestTag: {
          command: 'git describe --tags --abbrev=0',
          options: {
            execOptions: {
              cwd: './'
            },
            callback: function(exitCode, stdOutStr, stdErrStr, done) { 
              console.log(stdOutStr);
                done();
            }
          }
        }
      }
    };
  },
  registerCustomTasks: {

  },
  register: function (grunt) {
    grunt.registerTask('release', ['shell:getReleaseBranch','shell:fetchTags','shell:getLatestTag']);
  }

}
module.exports = TaskRunner.init.bind(TaskRunner);

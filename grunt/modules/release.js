var path = require('path');
var fs = require('fs');
var prompt = require('prompt');

var TaskRunner = {
  version: '',
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
            callback: function (exitCode, stdOutStr, stdErrStr, done) {
              if (stdErrStr) {
                console.log("No Tags found");
                grunt.option("versionNumber", "v1.0.0");
              } else {
                grunt.option("versionNumber", stdOutStr);
                console.log("Tags found");
              }

              TaskRunner.bumpVersionNumber(grunt);

              done();
            }
          }
        }
      }
    };
  },
  registerCustomTasks: {
    prompt:function(){
     prompt.start();
     prompt.get(['continue'], function (err, result) {
      console.log('Command-line input received:');
      console.log('  continue: ' + result.continue);
    });
   }
 },
 bumpVersionNumber: function (grunt) {
  var type = "patch";
  if (grunt.option("minor")) {
    type = "minor";
  } else if (grunt.option("major")) {
    type = "major";
  }
  var arr = grunt.option("versionNumber").split(".");
  switch (type) {
    case 'minor':
    arr[1] = Number(arr[1]) + 1;
    arr[2] = "0";
    break;
    case 'patch':
    arr[2] = Number(arr[2]) + 1;
    break;
    case 'major':
    arr[0] = "v" + String(Number(arr[0].replace("v", "")) + 1);
    arr[1] = "0";
    arr[2] = "0";
    break;
  }
  console.log("New Tag created" + arr.join("."));
  grunt.option("versionNumber", arr.join("."));
},
register: function (grunt) {
    //register custom tasks
    for(var key in this.registerCustomTasks){
      grunt.registerTask(key,this.registerCustomTasks[key])
    }
    //register standard tasks
    grunt.registerTask('release', ['shell:getReleaseBranch', 'shell:fetchTags', 'shell:getLatestTag','prompt']);
  }

}
module.exports = TaskRunner.init.bind(TaskRunner);

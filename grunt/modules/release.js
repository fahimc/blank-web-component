var path = require('path');
var fs = require('fs');
var prompt = require('prompt');

var TaskRunner = {
  _replaceBower:false,
  _grunt:null,
  version: '',
  init: function (grunt) {
    this._grunt=grunt;
    this.loadNPM(grunt);
    this.register(grunt);
    return this.getGruntConfig(grunt);
  },
  loadNPM: function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.loadNpmTasks('grunt-shell-spawn');
    grunt.loadNpmTasks('grunt-replace');
  },
  getGruntConfig: function (grunt) {
    var directory = grunt.option('project');

    return {
      replace: {
        bower: {
          options: {
            patterns: [
            {
              match: /../g,
              replacement: '..'
            }
            ]
          },
          files: [
          {
            cwd: './',
            expand: true,
            src: ['**/*.{html,xhtml,htm,js}', '!**/../**', '!**/node_modules/**', '!**/lib/**', '!**/Gruntfile.js'],
            dest: './'
          }
          ]
        }
      },
      shell: {
        getReleaseBranch: {
          command: 'git checkout release',
          options: {
            execOptions: {
              cwd: './'
            }
          }
        },
        mergeMasterBranch: {
          command: 'git merge master',
          options: {
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
        },
        createReleaseTag: {
          command: "git tag -a <%= grunt.option(\"versionNumber\") %> -m \"Release <%= grunt.option(\"versionNumber\") %>\"" ,
          options: {
          }
        },
        commitReleaseBranch: {
          command: 'git add --all && git commit -m "Replaced tags"',
          options: {
          }
        },
        pushReleaseBranch: {
          command: 'git push origin release --follow-tags',
          options: {
          }
        }
      }
    };
  },
  registerCustomTasks: {
    tagPrompt:function(){
      var done = this.async();
      console.log('Are you sure you want to create '+TaskRunner._grunt.option("versionNumber")+' tag?');
      prompt.message ='type \'y\' or \'n\' and hit enter';
      prompt.start();
      prompt.get(['continue'], function (err, result) {
        if(result.continue.trim().toLowerCase() === "y"){
          console.log("\nokay creating tag "+TaskRunner._grunt.option("versionNumber"));
          done();
        }else{
          TaskRunner._grunt.fail.fatal("tag cancelled");
        }
      });
    },
    replacePrompt:function(){
      var done = this.async();
      console.log('do you want to replace bower file paths?');
      prompt.message ='type \'y\' or \'n\' and hit enter';
      prompt.start();
      prompt.get(['continue'], function (err, result) {
        if(result.continue.trim().toLowerCase() === "y"){
          console.log("\nokay replacing bower paths");
          TaskRunner._replaceBower=true;
        }else{
          console.log("\nokay NOT replacing bower paths");
          TaskRunner._replaceBower=false;
        }
        done();
      });
    },
    replaceBower:function(){
      if(TaskRunner._replaceBower){
        TaskRunner._grunt.task.run( 'replace' );
      }else{
      }
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
    grunt.registerTask('release', ['shell:getReleaseBranch', 'shell:fetchTags','shell:mergeMasterBranch','replacePrompt','replaceBower', 'shell:commitReleaseBranch', 'shell:getLatestTag','tagPrompt','shell:createReleaseTag']);
  }

}
module.exports = TaskRunner.init.bind(TaskRunner);

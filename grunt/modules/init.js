var path = require('path');

var TaskRunner = {
  _grunt: null,
  seedTypes: {
    'component': 'https://github.com/thomsonreuters/jet-seed',
    'plugin': 'https://github.com/thomsonreuters/jet-plugin-seed'
  },
  init: function (grunt) {
    this._grunt = grunt;
    this.loadNPM(grunt);
    this.register(grunt);
    return this.getGruntConfig(grunt);
  },
  loadNPM: function (grunt) {
    grunt.loadNpmTasks('grunt-shell-spawn');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
  },
  getGruntConfig: function (grunt) {
    var project = grunt.option('project') || './';
    var folderName = project.substr(project.lastIndexOf('\\') + 1);
    console.log(project+"/tmp");
    return {
      replace: {
        init: {
          options: {
            patterns: [{
              match: /jet-seed|jet-plugin-seed/g,
              replacement: folderName
            }, {
              match: /Seed/g,
              replacement: function () {
                var index = folderName.lastIndexOf('-');
                if (index > -1) {
                  var replaceText = folderName.substring(index + 1);
                  return replaceText[0].toUpperCase() + replaceText.substring(1);
                } else
                  return folderName;
              }
            }]
          },
          files: [{
            cwd: project,
            expand: true,
            src: ['**/*','!**/Gruntfile.js','!**/node_modules/**','!**/grunt/**'],
            dest: project
          }]
        }
      },
      copy: {
        init: {
          expand: true,
          cwd: path.join(project, 'tmp'),
          dot: true,
          src: ['**', '!.git/**'],
          dest: project,
          rename: function (dest, src) {
            return path.join(dest, src.replace(/jet-seed|jet-plugin-seed/g, folderName));
          }
        }
      },
      clean: {
        temp: {
          options:{
            force:true
          },
          src: [project+"\\tmp"]
        }
      },
      shell: {
        cloneSeed: {
          command: 'git clone ' + TaskRunner.seedTypes[TaskRunner.getSeedType()] + ' tmp',
          options: {
            execOptions: {
              cwd: project
            }
          }
        },
        bowerInstall: {
          command: 'bower install',
          options: {
            execOptions: {
              cwd: project
            }
          }
        }
      }
    };
  },
  getSeedType: function () {

    // If no type or wrong type, default to component
    if (TaskRunner._grunt.option('type') === undefined || seedTypes[TaskRunner._grunt.option('type')] === undefined) {
      return 'component';
    }

    return TaskRunner._grunt.option('type');

  },
  registerCustomTasks: {

  },
  register: function (grunt) {
    grunt.registerTask('init', ['shell:cloneSeed', 'copy:init', 'replace:init', 'shell:bowerInstall','clean:temp']);
  }

}
module.exports = TaskRunner.init.bind(TaskRunner);

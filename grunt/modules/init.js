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
    var folder = process.cwd().substr(process.cwd().lastIndexOf('\\') + 1);
    var project = grunt.option('project') || folder;
    console.log(project);
    return {
      replace: {
        init: {
          options: {
            patterns: [{
              match: /jet-seed|jet-plugin-seed/g,
              replacement: project
            }, {
              match: /Seed/g,
              replacement: function () {
                var index = project.lastIndexOf('-');
                if (index > -1) {
                  var replaceText = project.substring(index + 1);
                  return replaceText[0].toUpperCase() + replaceText.substring(1);
                } else
                  return project;
              }
            }]
          },
          files: [{
            cwd: './',
            expand: true,
            src: ['**/*','!**/Gruntfile.js','!**/node_modules/**','!**/grunt/**'],
            dest: './'
          }]
        }
      },
      copy: {
        init: {
          expand: true,
          cwd: path.join('./', 'tmp'),
          dot: true,
          src: ['**', '!.git/**'],
          dest: './',
          rename: function (dest, src) {
            return path.join(dest, src.replace(/jet-seed|jet-plugin-seed/g, project));
          }
        }
      },
      clean: {
        temp: {
          src: ["./tmp"]
        }
      },
      shell: {
        cloneSeed: {
          command: 'git clone ' + TaskRunner.seedTypes[TaskRunner.getSeedType()] + ' tmp',
          options: {
            execOptions: {
              cwd: './'
            }
          }
        },
        bowerInstall: {
          command: 'bower install',
          options: {
            execOptions: {
              cwd: './'
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

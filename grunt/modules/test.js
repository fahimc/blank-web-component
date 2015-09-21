var path = require('path');

var TaskRunner = {
  init: function (grunt) {
    this.loadNPM(grunt);
    this.register(grunt);
    return this.getGruntConfig(grunt);
  },
  loadNPM: function (grunt) {
    grunt.loadNpmTasks('grunt-eslint');
  },
  getGruntConfig: function (grunt) {
  	var directory = grunt.option('project') || './';

    return {
      eslint: {
        options: {
          configFile: path.join(__dirname, 'test/lint/.eslintrc'),
          ignorePath: path.join(__dirname, 'test/lint/.eslintignore'),
          extensions: ['.js', '.html', '.xhtml', '.htm'],
          format: (grunt.option('o') === undefined && grunt.option('output') === undefined) ? 'stylish' : 'html',
          outputFile: (grunt.option('o') === undefined && grunt.option('output') === undefined) ? '' : path.join(directory, 'test/reports/lint.html')
        },
        one: directory
      },
    };
  },
  registerCustomTasks:{

  },
  register: function (grunt) {
    grunt.registerTask('test', ['eslint']);
  }

}
module.exports = TaskRunner.init.bind(TaskRunner);

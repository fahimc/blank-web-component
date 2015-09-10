
module.exports = function (grunt) {

 grunt.loadNpmTasks('grunt-replace');
 grunt.loadNpmTasks('grunt-eslint');
 grunt.loadNpmTasks('grunt-shell-spawn');
 grunt.loadNpmTasks('grunt-bump');


 grunt.initConfig({
  eslint: {
    options: {
      configFile:  './test/lint/.eslintrc',
      ignorePath:'./test/lint/.eslintignore',
      extensions: ['.js', '.html', '.xhtml', '.htm'],
      format: (grunt.option('o') === undefined && grunt.option('output') === undefined) ? 'stylish' : 'html',
      outputFile: (grunt.option('o') === undefined && grunt.option('output') === undefined) ? '' :'./test/reports/lint.html'
    },
    one: './'
  },
  replace: {
    bower: {
      options: {
        patterns: [
        {
          match: /bower_components/g,
          replacement: '..'
        }
        ]
      },
      files: [
      {
        cwd: './',
        expand: true,
        src: ['**/*.{html,xhtml,htm,js}', '!**/bower_components/**', '!**/node_modules/**', '!**/lib/**', '!**/Gruntfile.js'],
        dest: './'
      }
      ]
    }
  },
  shell: {
    switchToReleaseBranch: {
      command: 'git checkout release',
      options: {
      }
    },
    pullReleaseBranch: {
      command: 'git pull origin release',
      options: {
      }
    },
    pushReleaseBranch: {
      command: 'git push origin release --follow-tags',
      options: {
      }
    },
    mergeMasterBranch: {
      command: 'git merge master',
      options: {
      }
    },
    commitReleaseBranch: {
      command: 'git add --all && git commit -m "Replaced tags"',
      options: {
      }
    },
    getLastTag: {
      command: 'git describe --abbrev=0 --tags',
      options: {
        callback: function(exitCode, stdOutStr, stdErrStr, done) { 
          if(stdErrStr)
          {
             grunt.option("versionNumber",  "v1.0.0");
          }else{
            grunt.option("versionNumber", stdOutStr);
            console.log("version number:"+stdOutStr);
            bumpVersionNumber('minor');
          }
          done();
        }
      }
    },
    createReleaseTag: {
      command: "git tag -a <%= grunt.option(\"versionNumber\") %> -m \"Release <%= grunt.option(\"versionNumber\") %>\"" ,
      options: {
      }
    }
  }
});


function bumpVersionNumber(type){
  var arr = grunt.option("versionNumber").split(".");
  switch(type){
    case 'minor':
    arr[2] = Number(arr[2])+1;
    break;
    case 'patch':
    break;
    case 'major':
    break;
  }

  grunt.option("versionNumber",arr.join("."));
}


grunt.registerTask('default', []);
grunt.registerTask('rb', ['shell:switchToReleaseBranch','shell:pullReleaseBranch','shell:mergeMasterBranch','replace:bower','shell:commitReleaseBranch','shell:getLastTag','shell:createReleaseTag','shell:pushReleaseBranch']);
grunt.registerTask('release', ['replace:bower']);

};


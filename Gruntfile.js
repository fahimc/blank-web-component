
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

            var type="patch";
            if(grunt.option("minor") ){
              type="minor";
            }else if(grunt.option("major")){
              type="major";
            }
            bumpVersionNumber(type);
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
  console.log("before "+grunt.option("versionNumber"));
  var arr = grunt.option("versionNumber").split(".");
  switch(type){
    case 'minor':
    arr[1] = Number(arr[1])+1;
    arr[0] = "0";
    break;
    case 'patch':
    arr[2] = Number(arr[2])+1;
    break;
    case 'major':
    arr[0] = "v"+Number(arr[0])+1;
    arr[1] = "0";
    arr[2] = "0";
    break;
  }
console.log(arr.join("."));
  grunt.option("versionNumber",arr.join("."));
}

grunt.registerTask("force",function(set){
    if (set === "on") {
        grunt.option("force",true);
    }
    else if (set === "off") {
        grunt.option("force",false);
    }
    else if (set === "restore") {
        grunt.option("force",previous_force_state);
    }
});

grunt.registerTask('default', []);
grunt.registerTask('rb', ['shell:switchToReleaseBranch','shell:pullReleaseBranch','shell:mergeMasterBranch','replace:bower','force:on','shell:commitReleaseBranch','force:off','shell:getLastTag','shell:createReleaseTag','shell:pushReleaseBranch']);
grunt.registerTask('release', ['replace:bower']);

};


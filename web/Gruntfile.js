var web_dependencies = require('./web_dependencies');

var watchInterval = 1000;

var jsSourceFiles = [
  'app.js',
  'index/**/*.js',
  'views/**/*.js',
  'directives/**/*.js',
  'services/**/*.js',
  'filters/**/*.js',
  '!index/**/*_spec.js',
  '!views/**/*_spec.js',
  '!directives/**/*_spec.js',
  '!services/**/*_spec.js',
  '!filters/**/*_spec.js'
];

var cssSourceFiles = [
  'app.css',
  'index/**/*.css',
  'views/**/*.css',
  'directives/**/*.css',
];

var htmlSourceFiles = [
  'views/**/*.html',
  'directives/**/*.html'
];

module.exports = function(grunt) {

  grunt.initConfig({

    concat: {
      options: {
        separator: '\n'
      },
      jsDeps: {
        src: web_dependencies,
        dest: '../nginx/public/dist/dependencies.js'
      },
      jsSrc: {
        src: jsSourceFiles,
        dest: '../nginx/public/dist/app.js'
      },
      cssDeps: {
        src: [
          'bower_components/angular-material/angular-material.min.css',
          'bower_components/angular-material/angular-material.layouts.min.css'
        ],
        dest: '../nginx/public/dist/dependencies.css'
      },
      cssSrc: {
        src: cssSourceFiles,
        dest: '../nginx/public/dist/app.css'
      }
    },

    copy: {
      index: {
        src: 'index/index.html',
        dest: '../nginx/public/index.html'
      },
      assets: {
        src: 'assets/**/*',
        dest: '../nginx/public/',
        expand: true
      }
    },

    cssmin: {
      target: {
        files: {
          '../nginx/public/dist/app.css': ['../nginx/public/dist/app.css']
        }
      }
    },

    html2js: {
      options: {
        module: 'caf.templates',
        singleModule: true,
        rename: function(moduleName) {
          var split = moduleName.split('/');
          return 'templates/' + split[split.length - 1];
        },
        htmlmin: {
          collapseWhitespace: true,
          removeComments: true
        }
      },
      all: {
        src: htmlSourceFiles,
        dest: '../nginx/public/dist/templates.js'
      }
    },

    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true,
        browsers: ['PhantomJS']
      }
    },

    replace: {
      googleMapsApiKey: {
        options: {
          patterns: [
            {
              match: 'googleMapsApiKey',
              replacement: process.env.GOOGLE_MAPS_API_KEY
            }
          ]
        },
        files: [{
          src: ['../nginx/public/dist/app.js'],
          dest: '../nginx/public/dist/app.js'
        }]
      },
      googleAnalyticsTrackingId: {
        options: {
          patterns: [
            {
              match: 'googleAnalyticsTrackingId',
              replacement: process.env.GOOGLE_ANALYTICS_TRACKING_ID
            }
          ]
        },
        files: [{
          src: ['../nginx/public/index.html'],
          dest: '../nginx/public/index.html'
        }]
      },
    },

    uglify: {
      options: {
        screwIE8: true
      },
      target: {
        files: {
          '../nginx/public/dist/app.js': ['../nginx/public/dist/app.js']
        }
      }
    },

    watch: {
      js: {
        files: jsSourceFiles,
        tasks: ['concat:jsSrc', 'replace:googleMapsApiKey'],
        options: {
          interval: watchInterval
        }
      },
      css: {
        files: cssSourceFiles,
        tasks: ['concat:cssSrc'],
        options: {
          interval: watchInterval
        }
      },
      html: {
        files: htmlSourceFiles.concat(['index/index.html']),
        tasks: ['html2js', 'copy:index', 'replace:googleAnalyticsTrackingId'],
        options: {
          interval: watchInterval
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-html2js');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-replace');

  var baseBuildTasks = [
    'concat:jsDeps',
    'concat:jsSrc',
    'concat:cssDeps',
    'concat:cssSrc',
    'copy:index',
    'copy:assets',
    'replace:googleMapsApiKey',
    'replace:googleAnalyticsTrackingId',
    'html2js'
  ];

  grunt.registerTask('build', baseBuildTasks);

  var prodBuildTasks = baseBuildTasks.concat(['cssmin', 'uglify']);
  grunt.registerTask('build:prod', prodBuildTasks);

};

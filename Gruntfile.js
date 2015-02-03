module.exports = function (grunt) {
  'use strict';

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Load grunt tasks automatically
  require('jit-grunt')(grunt);

  // Configurable paths
  var config = {
    app: 'app',
    dist: 'dist',
    pkg: grunt.file.readJSON('package.json'),
    bowerConf: grunt.file.exists('.bowerrc') ? grunt.file.readJSON('.bowerrc') : { directory : 'bower_components' }
  };

  // Force use of Unix newlines
  grunt.util.linefeed = '\n';

  grunt.initConfig({

    // Project settings
    config: config,

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      js: {
        files: ['<%= config.app %>/js/{,*/}*.js'],
        tasks: ['newer:jshint', 'newer:jscs', 'newer:concat', 'copy:dist'],
        options: {
          livereload: true
        }
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      less: {
        files: ['<%= config.app %>/less/{,*/}*.less'],
        tasks: ['less', 'autoprefixer']
      },
      img: {
        files: ['<%= config.app %>/img/{,*/}*.{gif,jpeg,jpg,png}'],
        tasks: ['newer:imagemin'],
        options: {
          livereload: true
        }
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= config.app %>/css/{,*/}*.css',
          '<%= config.app %>/img/{,*/}*',
          '<%= config.app %>/js/{,*/}*.js'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        open: true,
        livereload: 35729,
        // Change this to '0.0.0.0' to access the server from outside
        hostname: 'localhost'
      },
      livereload: {
        options: {
          middleware: function (connect) {
            return [
              connect.static('.'),
              connect().use('/dist/img', connect.static(config.app + '/img')),
              connect().use('/bower_components', connect.static('./bower_components'))
            ];
          }
        }
      },
      dist: {
        options: {
          base: '<%= config.dist %>',
          livereload: false
        }
      }
    },

    // Empties folders to start fresh
    clean: {
      server: {
        files: [{
          dot: true,
          src: [
            '<%= config.dist %>/{js,css}',
            '!<%= config.dist %>/.git*'
          ]
        }]
      },
      dist: {
        files: [{
          dot: true,
          src: [
            '<%= config.dist %>/*',
            '!<%= config.dist %>/.git*'
          ]
        }]
      }
    },

    // Make sure code scss are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '<%= config.app %>/js/.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%= config.app %>/js/{,*/}*.js',
        '!<%= config.app %>/js/vendor/*'
      ]
    },

    jscs: {
      options: {
        config: '<%= config.app %>/js/.jscs.json'
      },
      grunt: {
        options: {
          requireCamelCaseOrUpperCaseIdentifiers: null
        },
        src: 'Gruntfile.js'
      },
      src: [
      '<%= config.app %>/js/{,*/}*.js',
      '!<%= config.app %>/js/vendor/*'
      ]
    },

    less: {
      dist: {
        options: {
          strictMath: true,
          sourceMap: true,
          outputSourceFiles: true,
          sourceMapURL: 'style.css.map',
          sourceMapFilename: '<%= config.dist %>/css/style.css.map'
        },
        files: {
          '<%= config.dist %>/css/style.css': '<%= config.app %>/less/<%= config.pkg.name %>.less'
        }
      }
    },

    // Add vendor prefixed scss
    autoprefixer: {
      options: {
        browsers: ['last 2 versions', 'Firefox ESR'],
        map: true
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.dist %>/css',
          src: '{,*/}*.css',
          dest: '<%= config.dist %>/css'
        }]
      }
    },

    csscomb: {
      options: {
        config: '<%= config.app %>/less/.csscomb.json'
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.dist %>/css',
          src: '{,*/}*.css',
          dest: '<%= config.dist %>/css'
        }]
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= config.app %>',
          dest: '<%= config.dist %>',
          src: [
            '*.{ico,png,txt}',
            'img/{,*/}*.webp',
            '{,*/}*.{html}',
            'fonts/{,*/}*.*',
            'js/{,*/}*.js'
          ]
        }]
      },
      styles: {
        expand: true,
        cwd: '<%= config.app %>/css',
        dest: '<%= config.dist %>/css',
        src: '{,*/}*.css'
      }
    },

    // The following *-min tasks produce minified files in the dist folder
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>/img',
          src: '{,*/}*.{gif,jpeg,jpg,png}',
          dest: '<%= config.dist %>/img'
        }]
      }
    },

    cssmin: {
      options: {
        keepSpecialComments: '*',
        noAdvanced: true
      },
      dist: {
        src: '<%= config.dist %>/css/style.css',
        dest: '<%= config.dist %>/css/style.min.css'
      }
    },

    concat: {
      dist: {
        src: [
          '<%= config.bowerConf.directory %>/jquery/dist/jquery.js',

          '<%= config.bowerConf.directory %>/jqueryui/ui/core.js',
          '<%= config.bowerConf.directory %>/jqueryui/ui/widget.js',
          '<%= config.bowerConf.directory %>/jqueryui/ui/mouse.js',
          '<%= config.bowerConf.directory %>/jqueryui/ui/slider.js',

          '<%= config.app %>/js/*.js',
          '!<%= config.app %>/js/app.js'
        ],
        dest: '<%= config.dist %>/js/scripts.js'
      }
    },

    uglify: {
      dist: {
        files: {
          '<%= config.dist %>/js/scripts.min.js': '<%= config.dist %>/js/scripts.js'
        }
      }
    },

    // Run some tasks in parallel to speed up build process
    concurrent: {
      server: [
        'less',
        'copy',
        'concat'
      ],
      dist: [
        'less',
        'copy',
        'imagemin'
      ]
    }

  });

  grunt.registerTask('serve', 'start the server and preview your app, --allow-remote for remote access', function (target) {
    if (grunt.option('allow-remote')) {
      grunt.config.set('connect.options.hostname', '0.0.0.0');
    }
    if (target === 'dist') {
      return grunt.task.run(['dist', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'concurrent:server',
      'autoprefixer',
      'concat',
      'uglify',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('server', function (target) {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run([target ? ('serve:' + target) : 'serve']);
  });

  grunt.registerTask('test', function (target) {
    if (target !== 'watch') {
      grunt.task.run([
        'newer:jshint',
        'newer:jscs'
      ]);
    }
  });

  grunt.registerTask('dist', [
    'clean:dist',
    'concurrent:dist',
    'autoprefixer',
    'csscomb',
    'cssmin',
    'concat',
    'uglify',
    'copy:dist',
    'copy:styles'
  ]);

  grunt.registerTask('default', [
    'test',
    'dist'
  ]);

};

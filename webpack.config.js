const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    
    entry: {
      client: './src/client/js/main.js'
    },
    
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      clean: true
    },
    
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif|mp3|wav|ogg)$/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/[name][ext]'
          }
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name][ext]'
          }
        }
      ]
    },
    
    resolve: {
      extensions: ['.js', '.json'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@client': path.resolve(__dirname, 'src/client'),
        '@server': path.resolve(__dirname, 'src/server'),
        '@shared': path.resolve(__dirname, 'src/shared'),
        '@assets': path.resolve(__dirname, 'src/client/assets')
      }
    },
    
    plugins: [
      // Only add bundle analyzer in production or when explicitly requested
      ...(env.analyze ? [new BundleAnalyzerPlugin()] : [])
    ],
    
    devServer: {
      static: {
        directory: path.join(__dirname, 'public'),
      },
      compress: true,
      port: 8080,
      hot: true,
      open: true
    },
    
    // Temporarily removing optimization to ensure a single bundle
    // optimization: {
    //   splitChunks: {
    //     chunks: 'all',
    //     cacheGroups: {
    //       vendor: {
    //         test: /[\\/]node_modules[\\/]/,
    //         name: 'vendors',
    //         chunks: 'all',
    //       },
    //     },
    //   },
    // },
  };
}; 
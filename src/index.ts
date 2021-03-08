import fs from 'fs';
import path from 'path';
import glob from 'glob';
import util from 'util';
import mkdirp from 'mkdirp';
import validateOptions from 'schema-utils';
import { Compiler } from 'webpack';

export interface Pattern {
  find: string;
  replace: string;
}

export interface Options {
  cwd?: string;
  entry: string;
  output?: string;
  extensions: string[];
  patterns: Pattern[];
}

const optionSchema = {
  type: 'object',
  properties: {
    cwd: {
      type: 'string'
    },
    entry: {
      type: 'string'
    },
    output: {
      type: 'string'
    },
    extensions: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    patterns: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          find: {
            type: 'string'
          },
          replace: {
            type: 'string'
          }
        }
      }
    }
  },
  additionalProperties: false
};

export default class ThymeleafHtmlReplaceWebpackPlugin {
  private readonly PLUGIN_NAME = 'ThymeleafHtmlReplaceWebpackPlugin';
  constructor(private options: Options) {
    validateOptions(optionSchema, options, this.PLUGIN_NAME);
  }

  apply(compiler: Compiler): void {
    const cwd = ThymeleafHtmlReplaceWebpackPlugin.resolvePath(
      compiler.options.context,
      this.options.cwd
    );

    const output = ThymeleafHtmlReplaceWebpackPlugin.resolvePath(
      compiler.options.context,
      this.options.output
    );

    compiler.hooks.done.tap(this.PLUGIN_NAME, (stats) => {
      glob
        .sync(this.options.entry, {
          cwd
        })
        .forEach((file) => {
          let html = fs.readFileSync(path.join(cwd, file), 'utf-8');

          Object.keys(stats.compilation.assets)
            .filter((item: string) => {
              return this.options.extensions.some((extension) => {
                return item.split('?')[0].endsWith(extension);
              });
            })
            .forEach((item) => {
              const sep = item.split('?');
              const extension = path.extname(sep.length > 1 ? sep[0] : '');
              const hash = sep.length > 1 ? sep[1] : '';

              if (extension !== '') {
                const regex =
                  '(\\S+).' + extension.substr(1, extension.length) + '\\?.*$';
                const matches = item.match(new RegExp(regex));

                if (matches) {
                  const oldPath = matches[1] + extension;
                  const newPath = '@{/' + oldPath + "} + '?" + hash + "'";
                  this.options.patterns.forEach((pattern) => {
                    const search = util.format(pattern.find, oldPath);
                    const replacement = util.format(pattern.replace, newPath);
                    const regexp = new RegExp(search, 'gm');
                    html = html.replace(regexp, replacement);
                  });
                } else {
                  console.log('[warnings] %s replace hash failed.', item);
                }
              } else {
                console.log('[warnings] %s ext not found.', item);
              }
            });

          const fileOutput = path.resolve(output, file);
          const fileOutputDir = path.dirname(fileOutput);

          if (!fs.existsSync(fileOutputDir)) {
            mkdirp.sync(fileOutputDir);
          }

          fs.writeFileSync(fileOutput, html);
          console.log('%s created.', fileOutput);
        });
    });
  }

  static resolvePath(context?: string, input?: string): string {
    return input
      ? path.isAbsolute(input)
        ? input
        : path.resolve(context || '', input)
      : path.resolve(context || '');
  }
}

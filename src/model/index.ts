import { Rule, Tree, chain, SchematicContext, template, mergeWith, url, apply, move, SchematicsException } from '@angular-devkit/schematics';
import { Schema } from './schema';
import fetch from 'node-fetch';
import { Observable } from 'rxjs';
import { strings, normalize, experimental } from '@angular-devkit/core';

function getProperties(_options: Schema): Rule {

  return (host: Tree) => new Observable<Tree>((observer) => {
    fetch(_options.url)
      .then(res => res.json())
      .then(res => {
        Object.keys(res).forEach((prop) => {
          _options.properties[prop] = res[prop].constructor.name.toLowerCase();
        });
        observer.next(host);
        observer.complete();
      })
      .catch(err => {
        observer.error(err);
      });
  });

}

export function model(_options: Schema): Rule {

  return (tree: Tree, context: SchematicContext) => {

    const workspaceConfig = tree.read('/angular.json');
    if (!workspaceConfig) {
      throw new SchematicsException('Could not find Angular workspace configuration');
    }

    // convert workspace to string
    const workspaceContent = workspaceConfig.toString();

    // parse workspace string into JSON object
    const workspace: experimental.workspace.WorkspaceSchema = JSON.parse(workspaceContent);

    const defaultProject = workspace.defaultProject || '';
    const project = workspace.projects[_options.project || defaultProject];

    if (!_options.path) {
      _options.path = `${project.sourceRoot}/app`;
    }

    const sourceTemplate = url('./files');
    const sourceTemplateParametrize = apply(sourceTemplate, [
      template({
        ..._options,
        ...strings
      }),
      move(normalize(_options.path))
    ]);

    const rule = chain([
      getProperties(_options),
      mergeWith(sourceTemplateParametrize)
    ]);

    return rule(tree, context);

  }

}

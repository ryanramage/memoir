define('jam/jquery-lifestream/services/github', ['jquery', 'handlebars'], function(_, Handlebars){
return function( config, callback ) {
  var template = $.extend({},
    {
      commitCommentEvent: Handlebars.compile('commented on <a href="http://github.com/'
      + '{{status.repo.name}}">{{status.repo.name}}</a>'),
      createBranchEvent: Handlebars.compile('created branch <a href="http://github.com/'
      + '{{status.repo.name}}/tree/{{status.payload.ref}}">'
      + '{{status.payload.ref}}</a> at <a href="http://github.com/'
      + '{{status.repo.name}}">{{status.repo.name}}</a>'),
      createRepositoryEvent: Handlebars.compile('created repository <a href="http://github.com/'
      + '{{status.repo.name}}">{{status.repo.name}}</a>'),
      createTagEvent: Handlebars.compile('created tag <a href="http://github.com/'
      + '{{status.repo.name}}/tree/{{status.payload.ref}}">'
      + '{{status.payload.ref}}</a> at <a href="http://github.com/'
      + '{{status.repo.name}}">{{status.repo.name}}</a>'),
      deleteBranchEvent: Handlebars.compile('deleted branch {{status.payload.ref}} at '
      + '<a href="http://github.com/{{status.repo.name}}">'
      + '{{status.repo.name}}</a>'),
      deleteTagEvent: Handlebars.compile('deleted tag {{status.payload.ref}} at '
      + '<a href="http://github.com/{{status.repo.name}}">'
      + '{{status.repo.name}}</a>'),
      followEvent: Handlebars.compile('started following <a href="http://github.com/'
      + '{{status.payload.target.login}}">{{status.payload.target.login}}</a>'),
      forkEvent: Handlebars.compile('forked <a href="http://github.com/{{status.repo.name}}">'
      + '{{status.repo.name}}</a>'),
      gistEvent: Handlebars.compile('{{status.payload.action}} gist '
      + '<a href="http://gist.github.com/{{status.payload.gist.id}}">'
      + '{{status.payload.gist.id}}</a>'),
      issueCommentEvent: Handlebars.compile('commented on issue <a href="http://github.com/'
      + '{{status.repo.name}}/issues/{{status.payload.issue.number}}">'
      + '{{status.payload.issue.number}}</a> on <a href="http://github.com/'
      + '{{status.repo.name}}">{{status.repo.name}}</a>'),
      issuesEvent: Handlebars.compile('{{status.payload.action}} issue '
      + '<a href="http://github.com/{{status.repo.name}}/issues/'
      + '{{status.payload.issue.number}}">{{status.payload.issue.number}}</a> '
      + 'on <a href="http://github.com/{{status.repo.name}}">'
      + '{{status.repo.name}}</a>'),
      pullRequestEvent: Handlebars.compile('{{status.payload.action}} pull request '
      + '<a href="http://github.com/{{status.repo.name}}/pull/'
      + '{{status.payload.number}}">{{status.payload.number}}</a> on '
      + '<a href="http://github.com/{{status.repo.name}}">'
      + '{{status.repo.name}}</a>'),
      pushEvent: Handlebars.compile('pushed to <a href="http://github.com/{{status.repo.name}}'
      + '/tree/{{status.payload.ref}}">{{status.payload.ref}}</a> at '
      + '<a href="http://github.com/{{status.repo.name}}">'
      + '{{status.repo.name}}</a>'),
      watchEvent: Handlebars.compile('started watching <a href="http://github.com/'
      + '{{status.repo.name}}">{{status.repo.name}}</a>')
    },
    config.template),

  parseGithubStatus = function( status ) {
    if (status.type === 'CommitCommentEvent' ) {
      return template.commitCommentEvent( {status: status} );
    }
    else if (status.type === 'CreateEvent'
          && status.payload.ref_type === 'branch') {
      return template.createBranchEvent( {status: status} );
    }
    else if (status.type === 'CreateEvent'
          && status.payload.ref_type === 'repository') {
      return template.createRepositoryEvent( {status: status} );
    }
    else if (status.type === 'CreateEvent'
          && status.payload.ref_type === 'tag') {
      return template.createTagEvent( {status: status} );
    }
    else if (status.type === 'DeleteEvent'
          && status.payload.ref_type === 'branch') {
      return template.deleteBranchEvent( {status: status} );
    }
    else if (status.type === 'DeleteEvent'
          && status.payload.ref_type === 'tag') {
      return template.deleteTagEvent( {status: status} );
    }
    else if (status.type === 'FollowEvent' ) {
      return template.followEvent( {status: status} );
    }
    else if (status.type === 'ForkEvent' ) {
      return template.forkEvent( {status: status} );
    }
    else if (status.type === 'GistEvent' ) {
      if (status.payload.action === 'create') {
        status.payload.action = 'created'
      } else if (status.payload.action === 'update') {
        status.payload.action = 'updated'
      }
      return template.gistEvent( {status: status} );
    }
    else if (status.type === 'IssueCommentEvent' ) {
      return template.issueCommentEvent( {status: status} );
    }
    else if (status.type === 'IssuesEvent' ) {
      return template.issuesEvent( {status: status} );
    }
    else if (status.type === 'PullRequestEvent' ) {
      return template.pullRequestEvent( {status: status} );
    }
    else if (status.type === 'PushEvent' ) {
      status.payload.ref = status.payload.ref.split('/')[2];
      return template.pushEvent( {status: status} );
    }
    else if (status.type === 'WatchEvent' ) {
      return template.watchEvent( {status: status} );
    }
  },

  parseGithub = function( input ) {
    var output = [], i = 0, j;

    if (input.query && input.query.count && input.query.count >0) {
      j = input.query.count;
      for ( ; i<j; i++) {
        var status = input.query.results.json[i].json;
        output.push({
          raw: status,
          date: new Date(status.created_at),
          config: config,
          html: parseGithubStatus(status),
          url: 'https://github.com/' + config.user
        });
      }
    }

    return output;

  };

  $.ajax({
    url: $.fn.lifestream.createYqlUrl('select '
      + 'json.type, json.actor, json.repo, json.payload, json.created_at '
      + 'from json where url="https://api.github.com/users/' + config.user
      + '/events/public?per_page=100"'),
    dataType: 'jsonp',
    success: function( data ) {
      callback(null, parseGithub(data));
    },
    error : function(){
        callback('cant get github');
    }
  });

  // Expose the template.
  // We use this to check which templates are available
  return {
    "template" : template
  };

};
});

import os
from json import load
from subprocess import call

from fabric import Connection, task
from invoke.context import Context
from patchwork.transfers import rsync as rsync_

DOCKER_HOST_01 = '195.201.33.98'
DOCKER_HOST_02 = '195.201.226.98'
DEPLOY_DIR = '/opt/powonline'
ROLEDEFS = {
    'prod': DOCKER_HOST_01,
    'staging': '192.168.1.2',
    'dev': '127.0.0.1',
}


def rsync(ctx, *args, **kwargs):  # type: ignore
    """Ugly workaround for https://github.com/fabric/patchwork/issues/16."""
    ssh_agent = os.environ.get('SSH_AUTH_SOCK', None)
    if ssh_agent:
        ctx.config['run']['env']['SSH_AUTH_SOCK'] = ssh_agent
    return rsync_(ctx, *args, **kwargs)


@task
def develop(ctx):  # type: ignore
    ctx.run('npm install')


@task
def _build_js_remotely(conn, tmpdir):  # type: ignore
    with open('package.json') as fptr:
        pdata = load(fptr)
    version = pdata['version'].strip()
    with conn.cd(tmpdir):
        conn.run('docker build '
                 '-t exhuma/powonline-frontend:latest '
                 '-t exhuma/powonline-frontend:%s '
                 '.' % version)

@task
def build_js_package(ctx, environment):  # type: ignore

    host = ROLEDEFS[environment]
    with Connection(host) as conn:
        jstmp = conn.run('mktemp -d /tmp/deploy-powonline-js-XXXX').stdout.strip()
        try:
            rsync(conn, 'dist', jstmp)  # type: ignore
            conn.put('Dockerfile', jstmp)
            conn.put('nginx.conf', jstmp)
            _build_js_remotely(conn, jstmp)
        finally:
            conn.run('rm -rf %s' % jstmp)


@task
def build(ctx, environment='staging'):  # type: ignore
    build_js_package(ctx, environment)


@task
def run(ctx):  # type: ignore
    call(['npm', 'run', 'dev'])

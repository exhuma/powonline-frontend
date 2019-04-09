from json import load
from subprocess import call

from fabric import Connection, task
from invoke.context import Context
from patchwork.transfers import rsync

DOCKER_HOST_01 = '195.201.33.98'
DOCKER_HOST_02 = '195.201.226.98'
DEPLOY_DIR = '/opt/powonline'
ROLEDEFS = {
    'prod': DOCKER_HOST_01,
    'staging': '192.168.1.2',
    'dev': '127.0.0.1',
}


@task
def develop(ctx):  # type: ignore
    ctx.run('npm install')


@task
def build(ctx, with_docker_image=True):  # type: ignore
    ctx.run('npm run build', replace_env=False)
    if with_docker_image:
        ctx.run('docker build '
                   '-t exhuma/powonline-frontend:latest '
                   '.')


def _deploy_remotely(conn: Connection) -> None:  # type: ignore
    with open('package.json') as fptr:
        package = load(fptr)
    version = package['version']

    ctx = Context(conn.config)
    build(ctx, with_docker_image=False)

    tmpdir = conn.run('mktemp -d /tmp/deploy-powonline-fe-XXXX').stdout.strip()

    rsync(conn, 'dist', tmpdir)
    conn.put('Dockerfile', tmpdir)
    conn.put('nginx.conf', tmpdir)
    try:
        with conn.cd(tmpdir):
            conn.run('docker build '
                     '-t exhuma/powonline-frontend:latest '
                     '-t exhuma/powonline-frontend:%s '
                     '.' % version)
    finally:
        conn.run('rm -rf %s' % tmpdir)

    exists = conn.run('[ -d %s ] && echo 1 || echo 0' % DEPLOY_DIR).stdout.strip()
    if exists == '0':
        conn.sudo('install -o %s -d %s' % (conn.user, DEPLOY_DIR))
    with conn.quiet():
        conn.run('docker stop powonline-frontend')
        conn.run('docker rm powonline-frontend')
    conn.put('run-frontend.sh', '%s/run-frontend.sh.dist' % DEPLOY_DIR)
    with conn.cd(DEPLOY_DIR):
        conn.run('bash run-frontend.sh')


@task
def deploy(ctx, environment='staging'):  # type: ignore
    host = ROLEDEFS[environment]
    with Connection(host) as conn:
        _deploy_remotely(conn)

@task
def run(ctx):  # type: ignore
    call(['npm', 'run', 'dev'])

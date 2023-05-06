from json import load

from fabric import task


@task
def develop(ctx):  # type: ignore
    ctx.run("npm clean-install")


def _get_tag():
    with open("package.json") as fptr:
        pdata = load(fptr)
    version = pdata["version"].strip()
    return f"registry.digitalocean.com/michel-albert/powonline-frontend:{version}"


@task
def build_docker(conn):  # type: ignore
    tag = _get_tag()
    conn.run(f"docker build -t {tag} .", replace_env=False, pty=True)


@task
def deploy(ctx, environment="staging"):  # type: ignore
    tag = _get_tag()
    ctx.run(f"docker push {tag}")


@task
def run(ctx):  # type: ignore
    ctx.run("npm run dev", pty=True, replace_env=False)

const path = require('path');
const git = require('nodegit');
const fs = require('fs').promises;

const main = async() => {
    const repository = await git.Repository.open(path.resolve(__dirname, './.git'));
    const newTextFilePath = path.join(__dirname, 'new.txt');
    await fs.writeFile(newTextFilePath, `a freaking new text file -> ${Math.random()}`);
    const index = await repository.refreshIndex();
    await index.addByPath('new.txt')
    await index.write();
    console.info('writing index');
    const oid = await index.writeTree();
    console.info('writing index tree');
    const head = await git.Reference.nameToId(repository, 'HEAD');
    const parent = await repository.getCommit(head);
    const author = git.Signature.now('Github Action', 'action@github.com')
    const committer = git.Signature.now('Github Action', 'action@github.com')
    const newCommitId = await repository.createCommit('HEAD', author, committer, 'chore: update via action', oid, [parent]);
    console.info(`new commit created: id -> ${newCommitId}`);

    const remote = await git.Remote.create(repository, 'upstream', `silvercrown07:${process.env.GITHUB_TOKEN}@github.com/action-demo.git`)
    await remote.push(['refs/heads/master:refs/heads/master']);
    console.info('pushed to remote')
}

main().catch(console.error);
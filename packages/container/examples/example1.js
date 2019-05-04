const { Container } = require('../src');

class LetterRepository {
    list() {
        return ['A', 'B', 'C'];
    }
}

class LetterController {

    constructor({ letterRepository }) {
        this.letterRepository = letterRepository;
    }

    showList() {
        return this.letterRepository.list();
    }
}

class LetterServiceProvider {
    register(container) {
        container.set('letterRepository', () => new LetterRepository());
        container.set('letterController', () => new LetterController({
            letterRepository: container.get('letterRepository'),
        }));
    }
}

const container = new Container();
container.register(new LetterServiceProvider());

const letterController = container.get('letterController');
console.log(letterController.showList()); // ['A', 'B', 'C']

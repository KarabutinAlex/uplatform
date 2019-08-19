const { Container } = require('../src');

class LetterRepository {
  constructor({ letters }) {
    this.letters = letters;
  }

  list() {
    return this.letters;
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

const letterServiceProvider = (container) => {
  container.bind('letterRepository', () => new LetterRepository({
    letters: ['A', 'B', 'C'],
  }));

  container.bind('letterController', () => new LetterController({
    letterRepository: container.get('letterRepository'),
  }));
};

const container = new Container();

container.use(letterServiceProvider);

const letterController = container.get('letterController');

// Next code prints: ['A', 'B', 'C']
console.log(letterController.showList());

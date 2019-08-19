const { Container } = require('../src');

const letterService = (container) => {
  container.letterRepository = () => ({
    list: () => ['A', 'B', 'C'],
  });

  container.letterController = ({ letterRepository }) => ({
    showList: () => letterRepository.list(),
  });
};

const container = new Container();

container.register(letterService);

console.log(container.letterController.showList()); // ['A', 'B', 'C']

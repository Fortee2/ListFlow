# Contributing to Sales Auction Extension

Thank you for considering contributing to Sales Auction Extension! We welcome contributions from everyone. By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## How to Contribute

### Reporting Issues

If you encounter any issues or have suggestions for improvements, please open an issue on GitHub. Provide as much detail as possible, including steps to reproduce the issue and any relevant screenshots.

### Suggesting Features

If you have an idea for a new feature, please open an issue on GitHub and describe the feature in detail. We encourage discussion and feedback from the community.

### Submitting Pull Requests

1. **Fork the Repository**: Click the "Fork" button at the top right corner of the repository page to create a copy of the repository in your GitHub account.

2. **Clone the Repository**: Clone your forked repository to your local machine.
    ```sh
    git clone https://github.com/yourusername/sales-auction-extension.git
    cd sales-auction-extension
    ```

3. **Create a Branch**: Create a new branch for your changes.
    ```sh
    git checkout -b my-feature-branch
    ```

4. **Make Changes**: Make your changes to the codebase. Follow the coding standards and best practices outlined below.

5. **Commit Changes**: Commit your changes with a clear and descriptive commit message.
    ```sh
    git add .
    git commit -m "Add feature X"
    ```

6. **Push Changes**: Push your changes to your forked repository.
    ```sh
    git push origin my-feature-branch
    ```

7. **Open a Pull Request**: Open a pull request on GitHub from your feature branch to the `main` branch of the original repository. Provide a detailed description of your changes and any relevant information.

## Development Setup

### Prerequisites

- Node.js (version 14 or higher)
- npm (version 6 or higher)

### Installation

1. **Install Dependencies**: Install the project dependencies.
    ```sh
    npm install
    ```

2. **Build the Project**: Build the project using Webpack.
    ```sh
    npm run build
    ```

3. **Load the Extension in Chrome**:
    - Open Chrome and navigate to `chrome://extensions/`.
    - Enable "Developer mode" in the top right corner.
    - Click on "Load unpacked" and select the `dist` directory.

## Coding Standards

- Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) for JavaScript and TypeScript code.
- Use meaningful variable and function names.
- Write clear and concise comments to explain the purpose of the code.
- Ensure that your code is properly formatted and linted.

## Commit Messages

- Use clear and descriptive commit messages.
- Follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification for commit messages.

## Pull Request Process

- Ensure that your pull request is up-to-date with the latest changes from the `main` branch.
- Provide a detailed description of your changes and any relevant information.
- Address any feedback or requested changes from reviewers.
- Ensure that all tests pass and that there are no linting errors.

## License

By contributing to Sales Auction Extension, you agree that your contributions will be licensed under the ISC License.
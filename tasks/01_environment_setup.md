# Environment Setup Tasks

This document outlines all the tasks required to set up the development environment for the Time Oddity game project, based on the tech stack defined in `agent_docs/tech_stack.md`.

## ⚠️ Isolation Safeguards

**IMPORTANT**: This setup is designed to be completely isolated and will NOT interfere with other projects or system-wide packages. All dependencies are installed locally within the project directory.

## Prerequisites

### 1. Node.js Installation
- [x] **Install Node.js** (Latest LTS version)
  - Download from https://nodejs.org/
  - Verify installation: `node --version` and `npm --version`
  - **RECOMMENDED**: Use Node Version Manager (nvm) for version control
    - This prevents conflicts with system Node.js versions
    - Allows switching between Node.js versions per project
    - Install nvm: `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash`

### 2. Git Setup
- [x] **Initialize Git Repository** (if not already done)
  - `git init`
  - Create `.gitignore` file for Node.js project
- [x] **Configure Git** (if not already configured)
  - Set user name and email
  - Configure default branch name
- [x] **Verify Git isolation**
  - Ensure you're in the correct project directory
  - Check that no global Git hooks are being modified

## Project Structure Setup

### 3. Initialize Project
- [x] **Initialize npm project**
  - `npm init -y`
  - Update `package.json` with project metadata
  - Set up project scripts (dev, build, start, test)
- [x] **Create project directory structure**
  ```
  time-oddity/
  ├── src/
  │   ├── client/
  │   │   ├── js/
  │   │   ├── assets/
  │   │   └── index.html
  │   ├── server/
  │   └── shared/
  ├── public/
  ├── tasks/
  ├── agent_docs/
  ├── node_modules/     # Local dependencies only
  ├── package.json
  └── package-lock.json # Ensures dependency version consistency
  ```

## Core Dependencies Installation

### 4. Game Engine Setup
- [x] **Install Phaser 3** (LOCAL INSTALLATION ONLY)
  - `npm install phaser` (installs to ./node_modules)
  - Verify installation and import capability
  - Set up basic Phaser game configuration
  - **Verify**: Check that phaser is listed in package.json dependencies

### 5. Animation Library Setup
- [x] **Install GSAP (GreenSock Animation Platform)** (LOCAL INSTALLATION ONLY)
  - `npm install gsap` (installs to ./node_modules)
  - Verify Timeline functionality
  - Test basic animation capabilities
  - **Verify**: Check that gsap is listed in package.json dependencies

### 6. Audio Library Setup
- [x] **Install Howler.js** (LOCAL INSTALLATION ONLY)
  - `npm install howler` (installs to ./node_modules)
  - Test audio loading and playback
  - Verify cross-browser compatibility
  - **Verify**: Check that howler is listed in package.json dependencies

## Backend Setup

### 7. Server Dependencies
- [x] **Install Express.js** (LOCAL INSTALLATION ONLY)
  - `npm install express` (installs to ./node_modules)
  - Set up basic Express server structure
  - Configure middleware (CORS, body-parser, etc.)
  - **Verify**: Check that express is listed in package.json dependencies
- [x] **Install Socket.IO** (LOCAL INSTALLATION ONLY)
  - `npm install socket.io` (installs to ./node_modules)
  - Set up Socket.IO server integration
  - Test real-time communication
  - **Verify**: Check that socket.io is listed in package.json dependencies

### 8. Development Dependencies
- [x] **Install development tools** (LOCAL INSTALLATION ONLY)
  - `npm install --save-dev nodemon` (for server auto-restart)
  - `npm install --save-dev webpack` (for client bundling)
  - `npm install --save-dev webpack-cli`
  - `npm install --save-dev webpack-dev-server`
  - **Verify**: All tools are installed to ./node_modules and listed in devDependencies

## Build System Configuration

### 9. Webpack Setup
- [x] **Create webpack.config.js**
  - Configure entry points for client and server
  - Set up loaders for JavaScript, CSS, and assets
  - Configure output paths and optimization
  - **IMPORTANT**: Set output path to `./dist` (local to project)
- [x] **Configure asset handling**
  - Set up image/sprite loading
  - Configure audio file handling
  - Set up font loading
  - **IMPORTANT**: All asset paths should be relative to project root

### 10. Development Server Configuration
- [x] **Set up development scripts**
  - Configure `npm run dev` for development server
  - Set up hot reloading for client code
  - Configure nodemon for server auto-restart
  - **IMPORTANT**: Use project-specific ports (e.g., 3000, 8080) to avoid conflicts

## Asset Management

### 11. Asset Directory Structure
- [x] **Create asset directories**
  ```
  src/client/assets/
  ├── images/
  ├── audio/
  ├── sprites/
  └── fonts/
  ```
- [x] **Set up asset loading utilities**
  - Create asset preloader for Phaser
  - Set up audio sprite configuration for Howler.js
  - Configure GSAP asset loading
  - **IMPORTANT**: All asset paths should be relative to project structure

## Configuration Files

### 12. Environment Configuration
- [x] **Create environment files**
  - `.env` for environment variables (LOCAL TO PROJECT)
  - `.env.example` for documentation
  - Configure dotenv package: `npm install dotenv`
  - **IMPORTANT**: Add `.env` to .gitignore to prevent committing sensitive data
- [x] **Set up configuration management**
  - Create config files for different environments
  - Set up port configuration (use project-specific ports)
  - Configure database connections (if needed)
  - **IMPORTANT**: Use environment variables for configuration, not hardcoded values

## Testing Setup

### 13. Testing Framework
- [x] **Install testing dependencies** (LOCAL INSTALLATION ONLY)
  - `npm install --save-dev jest`
  - `npm install --save-dev @testing-library/jest-dom`
  - Configure Jest for both client and server testing
  - **IMPORTANT**: Configure Jest to run tests only within project directory
- [x] **Set up test scripts**
  - Configure `npm test` command
  - Set up test coverage reporting
  - Create basic test structure
  - **IMPORTANT**: Test output should go to `./coverage` directory

## Documentation Setup

### 14. Documentation Tools
- [x] **Install documentation generator** (LOCAL INSTALLATION ONLY)
  - `npm install --save-dev jsdoc`
  - Configure JSDoc for API documentation
  - Set up documentation build process
  - **IMPORTANT**: Output documentation to `./docs` directory
- [x] **Create README files**
  - Update main README.md with setup instructions
  - Create API documentation
  - Document development workflow

## Development Workflow

### 15. Code Quality Tools
- [x] **Install linting tools** (LOCAL INSTALLATION ONLY)
  - `npm install --save-dev eslint`
  - `npm install --save-dev prettier`
  - Configure ESLint rules for project
  - Set up Prettier formatting
  - **IMPORTANT**: Create project-specific `.eslintrc.js` and `.prettierrc`
- [x] **Configure pre-commit hooks** (PROJECT-SPECIFIC ONLY)
  - Install husky: `npm install --save-dev husky`
  - Set up lint-staged: `npm install --save-dev lint-staged`
  - Configure pre-commit validation
  - **IMPORTANT**: Husky hooks are installed locally and won't affect other projects

### 16. Version Control Setup
- [x] **Configure .gitignore**
  - Add Node.js specific ignores
  - Add build output directories
  - Add environment files
  - Add IDE-specific files
  - **IMPORTANT**: This .gitignore only affects this project
- [x] **Set up Git hooks** (PROJECT-SPECIFIC ONLY)
  - Configure commit message format
  - Set up branch protection rules (if using GitHub)
  - **IMPORTANT**: These are repository-specific settings

## Integration Testing

### 17. End-to-End Testing
- [x] **Install E2E testing tools** (LOCAL INSTALLATION ONLY)
  - `npm install --save-dev cypress` (or similar)
  - Set up basic E2E test structure
  - Configure test environment
  - **IMPORTANT**: Configure Cypress to use project-specific ports

## Performance Monitoring

### 18. Performance Tools
- [x] **Install performance monitoring** (LOCAL INSTALLATION ONLY)
  - Set up bundle analyzer: `npm install --save-dev webpack-bundle-analyzer`
  - Configure performance budgets
  - Set up monitoring for game performance
  - **IMPORTANT**: All monitoring should be project-specific

## Deployment Preparation

### 19. Production Build Setup
- [x] **Configure production build**
  - Set up webpack production configuration
  - Configure asset optimization
  - Set up environment-specific builds
  - **IMPORTANT**: Build output should go to `./dist` directory
- [x] **Create deployment scripts**
  - Set up build automation
  - Configure deployment pipeline
  - Set up environment deployment
  - **IMPORTANT**: Use project-specific environment variables

## Final Verification

### 20. Environment Validation
- [x] **Test complete setup**
  - Verify all dependencies are working
  - Test development server startup
  - Validate hot reloading functionality
  - Test basic game functionality
  - **VERIFY ISOLATION**: Confirm no global packages were modified
- [x] **Create setup verification script**
  - Write script to validate all components
  - Test asset loading
  - Verify real-time communication
  - **VERIFY ISOLATION**: Check that all dependencies are in ./node_modules

## Post-Setup Tasks

### 21. Initial Development
- [x] **Create basic game structure**
  - Set up Phaser game instance
  - Create basic scene structure
  - Implement basic player movement
- [x] **Set up basic server endpoints**
  - Create health check endpoint
  - Set up basic API structure
  - Test Socket.IO connection

## Isolation Verification Checklist

Before proceeding with development, verify that the setup is completely isolated:

- [x] **Node.js**: Using project-specific Node.js version (via nvm if available)
- [x] **Dependencies**: All packages installed to `./node_modules` only
- [x] **Ports**: Using project-specific ports (3000, 8080, etc.)
- [x] **Paths**: All file paths are relative to project root
- [x] **Environment**: Using project-specific `.env` file
- [x] **Git**: Repository is self-contained
- [x] **Build Output**: All output goes to project directories (`./dist`, `./coverage`, etc.)
- [x] **Global State**: No global npm packages or system files modified

---

## Notes

- All tasks should be completed in order as dependencies build upon each other
- Each task should be tested before moving to the next
- Keep track of any issues encountered during setup for future reference
- Document any deviations from the standard setup process
- Consider creating automated setup scripts for future team members
- **CRITICAL**: This setup is designed to be completely isolated and will not affect other projects

## Estimated Time

- **Prerequisites**: 10-15 minutes
- **Project Structure**: 5 minutes
- **Core Dependencies**: 10-15 minutes
- **Backend Setup**: 10-15 minutes
- **Build System**: 20-30 minutes
- **Asset Management**: 10 minutes
- **Configuration**: 10 minutes
- **Testing Setup**: 15-20 minutes
- **Documentation**: 10-15 minutes
- **Code Quality**: 15-20 minutes
- **Integration & Performance**: 15-20 minutes
- **Deployment Prep**: 15 minutes
- **Final Verification**: 10 minutes

**Total Estimated Time**: ~2-3 hours (down from 6 hours)

## Why the Original Estimates Were Too High:

1. **Overestimated complexity**: Many tasks are simple npm installs or basic configuration
2. **Included learning time**: Original estimates assumed unfamiliarity with tools
3. **Conservative approach**: Added buffer time that's not typically needed
4. **Redundant tasks**: Some verification steps overlap with actual setup

## Realistic Breakdown:

- **Simple tasks** (npm install, basic config): 5-10 minutes each
- **Medium tasks** (webpack setup, testing config): 15-20 minutes each  
- **Complex tasks** (full build system, deployment): 20-30 minutes each

## Factors That Can Affect Time:

- **Experience level**: Familiar developers can complete in 1-2 hours
- **System performance**: Faster machines reduce installation time
- **Network speed**: Dependencies download time varies
- **Tool familiarity**: First-time setup vs. experienced setup 
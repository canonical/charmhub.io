import { toggleModal } from '../tooltip-icon-modal';

describe('toggleModal', () => {
  let modal: HTMLElement;

  beforeEach(() => {
    modal = document.createElement('div');
    modal.classList.add('p-tooltip__modal');
    document.body.appendChild(modal);
  });

  afterEach(() => {
    document.body.removeChild(modal);
  });

  test('should show the modal if it is hidden', () => {
    modal.style.display = 'none';
    toggleModal(modal);
    expect(modal.style.display).toBe('flex');
  });

  test('should hide the modal if it is shown', () => {
    modal.style.display = 'flex';
    toggleModal(modal);
    expect(modal.style.display).toBe('none');
  });

  test('should not change display if modal is not p-tooltip__modal', () => {
    modal.classList.remove('p-tooltip__modal');
    modal.style.display = 'none';
    toggleModal(modal);
    expect(modal.style.display).toBe('none');
  });
});

describe('Document click handler', () => {
  let modal: HTMLElement;
  let target: HTMLElement;

  beforeEach(() => {
    modal = document.createElement('div');
    modal.id = 'test-modal';
    modal.classList.add('p-tooltip__modal');
    modal.style.display = 'none';
    document.body.appendChild(modal);

    target = document.createElement('button');
    target.setAttribute('aria-controls', 'test-modal');
    document.body.appendChild(target);
  });

  afterEach(() => {
    document.body.removeChild(modal);
    document.body.removeChild(target);
  });

  test('should show the modal when target is clicked', () => {
    target.click();
    expect(modal.style.display).toBe('flex');
  });

  test('should hide the modal when target is clicked again', () => {
    target.click(); // First click shows
    target.click(); // Second click hides
    expect(modal.style.display).toBe('none');
  });
});

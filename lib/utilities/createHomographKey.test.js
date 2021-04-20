import createHomographKey from './createHomographKey.js';
import { expect }         from 'chai';

describe('createHomographKey.js', () => {

  before(function() {
    this.index = new Map;
  });

  it('adds the first entry without a homograph number', function() {
    const index = new Map;
    const key   = createHomographKey('test', index);
    expect(key).to.equal('test');
    expect(this.index.size).to.equal(0);
  });

  it('adds the first homograph', function() {

    const index = new Map;
    index.set('test', { num: 1 });

    const key          = createHomographKey('test', index);
    const homographOne = index.get('test1');
    const homographTwo = index.get('test2');

    expect(key).to.equal('test2');
    expect(homographOne?.num).to.equal(1);
    expect(homographTwo).to.be.undefined;

  });

  it('adds the second homograph', () => {

    const index = new Map;
    index.set('test1', { num: 1 });
    index.set('test2', { num: 2 });

    const key            = createHomographKey('test', index);
    const homographOne   = index.get('test1');
    const homographTwo   = index.get('test2');
    const homographThree = index.get('test3');

    expect(key).to.equal('test3');
    expect(homographOne?.num).to.equal(1);
    expect(homographTwo?.num).to.equal(2);
    expect(homographThree).to.be.undefined;

  });

});

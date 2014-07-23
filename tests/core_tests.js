$(function(){

  /*
   * BASIC TESTS
   */
  QUnit.test('Empty builder', function(assert) {
    $('#container1').queryBuilder({ filters: basic_filters });
    assert.ok(rulesMatch($('#container1').queryBuilder('getRules'), {}), 'Should return empty object');
  });
  
  QUnit.test('Set/get rules', function(assert) {
    $('#container2').queryBuilder({ filters: basic_filters });
    $('#container2').queryBuilder('setRules', basic_rules);
    
    assert.ok(rulesMatch($('#container2').queryBuilder('getRules'), basic_rules), 'Should return object with rules');
    assert.deepEqual(getSelectOptions($('#container2_rule_1 [name$=_operator]')), basic_filters[1].operators, 'Should respect the order of operators');
  });
  
  QUnit.test('Empty value check', function(assert) {
    var error_str;
    $('#container3').queryBuilder({
      filters: basic_filters,
      onValidationError: function($rule, error, value, filter, operator) {
        error_str = error;
      }
    });
    $('#container3').queryBuilder('setRules', invalid_rules);
    
    assert.ok(rulesMatch($('#container3').queryBuilder('getRules'), {}), 'Should return empty object');
    assert.equal(error_str, 'string_empty', 'Should throw "string_empty" error');
  });
  
  QUnit.asyncTest('Language change', function(assert) {
    expect(2);
    var original = $.fn.queryBuilder.defaults.get('lang');
    
    $.getScript('../dist/i18n/fr.js', function() {
      assert.equal($.fn.queryBuilder.defaults.get('lang').delete_rule, 'Supprimer', 'Should be in french');
      $.fn.queryBuilder.defaults.set({ lang: original });
      assert.equal($.fn.queryBuilder.defaults.get('lang').delete_rule, 'Delete', 'Should be in english');
      QUnit.start();
    });
  });
  
  QUnit.test('Operators', function(assert) {
    $('#container4').queryBuilder({
      filters: filters_for_custom_operators,
      operators: custom_operators
    });
    
    $('#container4').queryBuilder('setRules', rules_for_custom_operators);

    assert.deepEqual(getSelectOptions($('#container4_rule_0 [name$=_operator]')), ['equal', 'not_equal'], 'String type should have equal & not_equal operators');
    assert.deepEqual(getSelectOptions($('#container4_rule_1 [name$=_operator]')), ['less', 'greater'], 'Number type should have less & greater operators');
    assert.deepEqual(getSelectOptions($('#container4_rule_2 [name$=_operator]')), ['before', 'after'], 'Datetime type should have before & after operators');
  });

});

function getSelectOptions($target) {
  var options = [];
  
  $target.find('option').each(function(){
    options.push($(this).val());
  });
  
  return options;
}

function rulesMatch(a, b) {
  if (a.hasOwnProperty('rules')) {
    if (!b.rules) {
      return false;
    }
    
    for (var i=0, l=a.rules.length; i<l; i++) {
      if (!b.rules[i] || !rulesMatch(a.rules[i], b.rules[i])) {
        return false;
      }
    }
    
    return a.condition == b.condition;
  }
  else {
    return a.id==b.id && a.operator==b.operator && a.value==b.value;
  }
}

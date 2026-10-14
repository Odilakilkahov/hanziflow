import { describe, expect, it } from 'vitest'
import { normalizePinyin, pinyinMatches, splitSyllables, stripTones, toNumbered, toneOf, tonesOf } from './pinyin'
import { ALL_WORDS } from '@/data/words'

describe('pinyin', () => {
  it('toneOf по диакритике, нейтральный без знака', () => {
    expect(toneOf('mā')).toBe(1)
    expect(toneOf('má')).toBe(2)
    expect(toneOf('mǎ')).toBe(3)
    expect(toneOf('mà')).toBe(4)
    expect(toneOf('ma')).toBe(5)
    expect(toneOf('nǚ')).toBe(3)
  })

  it('splitSyllables режет слитные слова правильно', () => {
    const cases: [string, string[]][] = [
      ['nǐ hǎo', ['nǐ', 'hǎo']],
      ['xièxie', ['xiè', 'xie']],
      ['píngguǒ', ['píng', 'guǒ']],
      ['diànnǎo', ['diàn', 'nǎo']],
      ['yìdiǎnr', ['yì', 'diǎnr']],
      ["nǚ'ér", ['nǚ', 'ér']],
      ['zěnmeyàng', ['zěn', 'me', 'yàng']],
      ['xiānsheng', ['xiān', 'sheng']],
      ['Wūzībiékèsītǎn', ['Wū', 'zī', 'bié', 'kè', 'sī', 'tǎn']],
      ['chūzūchē', ['chū', 'zū', 'chē']],
      ['shāngdiàn', ['shāng', 'diàn']],
    ]
    for (const [input, expected] of cases) {
      expect(splitSyllables(input).map((s) => s.text)).toEqual(expected)
    }
  })

  it('tonesOf и toNumbered', () => {
    expect(tonesOf('nǐ hǎo')).toEqual([3, 3])
    expect(tonesOf('xièxie')).toEqual([4, 5])
    expect(toNumbered('nǐ hǎo')).toBe('ni3 hao3')
    expect(toNumbered('xièxie')).toBe('xie4 xie')
  })

  it('stripTones / normalize / matches', () => {
    expect(stripTones('Běijīng')).toBe('Beijing')
    expect(normalizePinyin('Nǐ Hǎo')).toBe('nihao')
    expect(normalizePinyin('nv er')).toBe('nüer')
    expect(pinyinMatches('ni hao', 'nǐ hǎo')).toBe(true)
    expect(pinyinMatches('nihao', 'nǐ hǎo')).toBe(true)
    expect(pinyinMatches('ni hen', 'nǐ hǎo')).toBe(false)
  })

  it('каждое слово словаря даёт число слогов, равное числу иероглифов (эризация 儿 — один слог)', () => {
    const bad = ALL_WORDS.filter((w) => {
      // Эризация: 儿 сливается с предыдущим слогом (nǎr, diǎnr), но ér в 女儿 — отдельный слог.
      const erhua = w.hanzi.endsWith('儿') && /[^eēéěè]r$/.test(w.pinyin) && w.hanzi.length > 1
      return splitSyllables(w.pinyin).length !== w.hanzi.length - (erhua ? 1 : 0)
    })
    expect(bad.map((w) => `${w.hanzi} ${w.pinyin}`)).toEqual([])
  })
})

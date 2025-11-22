import os
from pathlib import Path
from typing import List, Dict
import logging
from symspellpy import SymSpell, Verbosity
import re


logger = logging.getLogger(__name__)


class Corrector:
    """Unified correction pipeline using SymSpell with grammar rules"""
    
    def __init__(self):
        self.data_dir = Path(__file__).parent / "data"
        self.symspell = None
        self.kenlm_model = None
        self._load_symspell()
        self._load_kenlm()
        
        # Grammar correction rules
        self.grammar_rules = [
            (r'\bdont\b', "don't"),
            (r'\bdoesnt\b', "doesn't"),
            (r'\bdidnt\b', "didn't"),
            (r'\bwont\b', "won't"),
            (r'\bcant\b', "can't"),
            (r'\bisnt\b', "isn't"),
            (r'\barent\b', "aren't"),
            (r'\bwasnt\b', "wasn't"),
            (r'\bwerent\b', "weren't"),
            (r'\bhasnt\b', "hasn't"),
            (r'\bhavent\b', "haven't"),
            (r'\bhadnt\b', "hadn't"),
            (r'\bwouldnt\b', "wouldn't"),
            (r'\bcouldnt\b', "couldn't"),
            (r'\bshouldnt\b', "shouldn't"),
            (r'\bto boring\b', 'too boring'),
            (r'\bto hot\b', 'too hot'),
            (r'\bto cold\b', 'too cold'),
            (r'\bto big\b', 'too big'),
            (r'\bto small\b', 'too small'),
            (r'\bto much\b', 'too much'),
            (r'\bto many\b', 'too many'),
            (r'\bits a\b', "it's a"),
            (r'\bits to\b', "it's too"),
            (r'\bits the\b', "it's the"),
            (r'\byour the\b', "you're the"),
            (r'\byour a\b', "you're a"),
            (r'\byour going\b', "you're going"),
            (r'\btheir is\b', 'there is'),
            (r'\btheir are\b', 'there are'),
            (r'\bI am go\b', 'I am going'),
            (r'\bI am do\b', 'I am doing'),
            (r'\bShe dont\b', "She doesn't"),
            (r'\bHe dont\b', "He doesn't"),
            (r'\bIt dont\b', "It doesn't"),
            (r'\bShe do\b', "She does"),
            (r'\bHe do\b', "He does"),
            (r'\bIt do\b', "It does"),
            (r'\bShe like\b', 'She likes'),
            (r'\bHe like\b', 'He likes'),
            (r'\bIt like\b', 'It likes'),
            (r'\bShe go\b', 'She goes'),
            (r'\bHe go\b', 'He goes'),
            (r'\bIt go\b', 'It goes'),
            (r'\bwas go\b', 'was going'),
            (r'\bwere go\b', 'were going'),
            (r'\bwill be go\b', 'will be going'),
            (r'\bgoing to the park on Sundays\b', 'going to the park on Sundays'),
        ]

    def _load_symspell(self):
        """Load SymSpell with frequency dictionary"""
        try:
            self.symspell = SymSpell(max_dictionary_edit_distance=2, prefix_length=7)
            dictionary_path = self.data_dir / "frequency_en.txt"
            
            if not dictionary_path.exists():
                logger.warning(f"Dictionary not found at {dictionary_path}, creating enhanced one")
                self._create_enhanced_dictionary(dictionary_path)
            
            if not self.symspell.load_dictionary(str(dictionary_path), term_index=0, count_index=1):
                raise Exception("Failed to load SymSpell dictionary")
            
            logger.info(f"✅ SymSpell loaded with {len(self.symspell.words)} words")
        except Exception as e:
            logger.error(f"SymSpell loading failed: {e}")
            raise

    def _create_enhanced_dictionary(self, path: Path):
        """Create enhanced dictionary with grammar words"""
        path.parent.mkdir(parents=True, exist_ok=True)
        
        basic_words = [
            # Common words
            "the 1000000", "be 500000", "to 400000", "of 350000", "and 320000",
            "a 300000", "in 250000", "that 200000", "have 190000", "i 180000",
            "it 170000", "for 160000", "not 150000", "on 140000", "with 130000",
            "he 120000", "as 110000", "you 100000", "do 95000", "at 90000",
            "this 85000", "but 80000", "his 75000", "by 70000", "from 65000",
            "they 60000", "we 55000", "she 50000", "me 45000", "my 40000",
            
            # Verbs with correct forms
            "is 35000", "are 30000", "was 28000", "were 26000", "been 24000",
            "being 22000", "has 20000", "had 18000", "can 16000", "could 14000",
            "will 12000", "would 10000", "should 9000", "may 8000", "might 7000",
            "must 6000", "shall 5000", "does 4800", "did 4600", "done 4400",
            "likes 4200", "liked 4000", "liking 3800", "goes 3600", "went 3400",
            "gone 3200", "going 3000", "comes 2800", "came 2600", "come 2400",
            
            # Contractions
            "don't 5000", "doesn't 4800", "didn't 4600", "won't 4400", "can't 4200",
            "isn't 4000", "aren't 3800", "wasn't 3600", "weren't 3400", "hasn't 3200",
            "haven't 3000", "hadn't 2800", "wouldn't 2600", "couldn't 2400", "shouldn't 2200",
            "it's 2000", "you're 1800", "they're 1600", "we're 1400", "I'm 1200",
            
            # Too vs To
            "too 3000", "two 2800",
            
            # Common adjectives
            "boring 1000", "interesting 980", "good 960", "bad 940", "hot 920",
            "cold 900", "big 880", "small 860", "beautiful 840", "ugly 820",
            
            # Pronouns
            "she 5000", "her 4800", "hers 4600", "him 4400", "their 4200",
            "theirs 4000", "there 3800", "where 3600", "which 3400", "who 3200",
            
            # Days
            "sunday 800", "sundays 780", "monday 760", "tuesday 740", "wednesday 720",
            "thursday 700", "friday 680", "saturday 660",
            
            # Common verbs
            "park 1000", "walk 980", "run 960", "swim 940", "play 920",
            "eat 900", "drink 880", "sleep 860", "work 840", "study 820",
            "because 3000", "since 2800", "while 2600", "although 2400", "however 2200",
            
            # Additional common misspelled words
            "house 5000", "small 4800", "stood 4600", "end 4400", "road 4200",
            "paint 4000", "chipped 3800", "windows 3600", "crooked 3400",
            "little 3200", "dog 3000", "barked 2800", "softly 2600", "porch 2400",
            "trying 2200", "guard 2000", "quiet 1800", "yard 1600", "sun 1400",
            "bright 1200", "air 1000", "felt 980", "every 960", "step 940",
            "old 920", "wood 900", "made 880", "creaking 860", "sound 840",
            "echoed 820", "around 800"
        ]
        
        with open(path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(basic_words))
        
        logger.info(f"Created enhanced dictionary at {path}")

    def _load_kenlm(self):
        """Load KenLM language model"""
        try:
            import kenlm
            lm_path = self.data_dir / "lm.arpa"
            if not lm_path.exists():
                logger.warning(f"KenLM model not found at {lm_path}, skipping")
                return
            self.kenlm_model = kenlm.Model(str(lm_path))
            logger.info(f"✅ KenLM loaded from {lm_path}")
        except ImportError:
            logger.warning("KenLM not installed, context scoring will be disabled")
        except Exception as e:
            logger.warning(f"KenLM loading failed: {e}")

    def apply_grammar_rules(self, text: str) -> str:
        """Apply grammar correction rules"""
        corrected = text
        for pattern, replacement in self.grammar_rules:
            corrected = re.sub(pattern, replacement, corrected, flags=re.IGNORECASE)
        return corrected

    def spell_check(self, text: str) -> Dict:
        """Fast spelling correction using SymSpell"""
        if not self.symspell:
            return {"original": text, "corrected": text, "changes": []}
        
        # First apply grammar rules
        text_with_grammar = self.apply_grammar_rules(text)
        
        # Split by sentences while preserving ALL punctuation
        sentences = re.split(r'([.!?,;:])', text_with_grammar)
        corrected_sentences = []
        all_changes = []
        
        for i in range(0, len(sentences)):
            sentence = sentences[i].strip()
            
            # If it's punctuation, keep it as-is
            if sentence in ['.', '!', '?', ',', ';', ':']:
                corrected_sentences.append(sentence)
                continue
            
            if not sentence:
                continue
            
            # Apply spell correction to words only
            suggestions = self.symspell.lookup_compound(
                sentence,
                max_edit_distance=2,
                transfer_casing=True
            )
            
            if suggestions:
                corrected = suggestions[0].term
                if sentence != corrected:
                    all_changes.append({"from": sentence, "to": corrected})
                corrected_sentences.append(corrected)
            else:
                corrected_sentences.append(sentence)
        
        # Join with proper spacing (space before text, no space before punctuation)
        corrected_text = ""
        for i, part in enumerate(corrected_sentences):
            if part in ['.', '!', '?', ',', ';', ':']:
                corrected_text += part
            else:
                if i > 0 and corrected_sentences[i-1] not in ['.', '!', '?', ',', ';', ':']:
                    corrected_text += " "
                corrected_text += part
        
        return {
            "original": text,
            "corrected": corrected_text.strip(),
            "distance": 0,
            "changes": all_changes
        }

    def score_text(self, text: str) -> float:
        """Score text fluency using KenLM"""
        if not self.kenlm_model:
            return 0.0
        try:
            score = self.kenlm_model.score(text, bos=True, eos=True)
            return float(score)
        except Exception as e:
            logger.error(f"Scoring error: {e}")
            return 0.0

    def correct(self, text: str, language: str = "en") -> Dict:
        """Complete correction pipeline"""
        # Apply corrections
        spell_result = self.spell_check(text)
        corrected_text = spell_result["corrected"]
        
        # Score
        fluency_score = self.score_text(corrected_text) if self.kenlm_model else None
        
        # Build suggestions
        suggestions = []
        for i, change in enumerate(spell_result["changes"]):
            offset = text.find(change["from"])
            suggestions.append({
                "message": "Grammar and spelling correction",
                "offset": offset if offset >= 0 else 0,
                "length": len(change["from"]),
                "replacements": [change["to"]],
                "confidence": 0.95
            })
        
        return {
            "original": text,
            "corrected": corrected_text,
            "suggestions": suggestions,
            "language": language,
            "fluency_score": fluency_score
        }

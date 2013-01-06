;;; Test cases for Scheme.
;;;
;;; In order to run only a prefix of these examples, add the line
;;;
;;; (exit)
;;;
;;; after the last test you wish to run.

;;; *** Add more of your own here! ***


;;; Problem 7

(begin (+ 2 3) (+ 5 6))
; expect 11

(begin (define x 5) (define y 30) (+ x y))
; expect 35

(begin (define a '(1 2)) (define b '(3 4)) (cons a b))
; expect ((1 2) 3 4)

(begin 1 2 'hi 'hii)
; expect hii

(begin (+ 1 2))
; expect 3

;;; Problem 8

(lambda (a b c) (- (* b b) (* 4 a c)))
; expect (lambda (a b c) (- (* b b) (* 4 a c)))

(lambda (a) (define x 2) (+ x a))
; expect (lambda (a) (begin (define x 2) (+ x a)))

;;; Problem A9

(define (f x)
  (define (g y)
    (+ 1 y))
  (g x))
(f 2)
; expect 3

(f 3)
; expect 4

;;; Problem B12

(define (f1 a b) (+ a b))
(f1 1 2)
; expect 3

(define f2 (lambda () 5))
(f2)
; expect 5

;;; Problem A13

(if (= 1 1) 't 'f)
; expect t

(if #f 't 'f)
; expect f

(if 3.1415926 't 'f)
; expect t

(if nil 't 'f)
; expect t

(if '(a b c) 't 'f)
; expect t

(if 0 't 'f)
; expect t

;;; Problem B14

(and)
; expect True

(or)
; expect False

(and 4 5 6)
; expect 6

(or 5 2 1)
; expect 5

(and #t #f 42 (/ 1 0))
; expect False

(or 4 #t (/ 1 0))
; expect 4

;;; Problem A15

(cond ((= 4 3) 'nope)
      ((= 4 4) 'hi)
      (else 'wait))
; expect hi

(cond ((= 4 3) 'wat)
      ((= 4 4))
      (else 'hm))
; expect True

(cond ((= 4 4) 'here 42)
      (else 'wat 0))
; expect 42

(cond ((and 1 2)))
; expect 2

;;; Problem A16

(define x 'hi)
(define y 'bye)
(let ((x 42)
      (y (* 5 10)))
 (list x y))
; expect (42 50)

(list x y)
; expect (hi bye)

(define (november) 
  (let ((election 7))
    (let ((president (+ election 5)))
      (* president election))))
(november)
; expect 84

(let ((x 5))
  (let ((x 2)
	(y x))
    y))
; expect 5

;;; Problem B17

(mu (x) (+ x y))
; expect (mu (x) (+ x y))

(mu (a) (define x 2) (+ x a))
; expect (mu (a) (begin (define x 2) (+ x a)))

(define f (mu (x) (+ x y)))
(define g (lambda (x y) (f (+ x x))))
(g 3 7)
; expect 13

; mu shouldn't change bindings in the frame it is called
(define f (mu (x) (define y (+ x z)) y))
(define z 1)
(define y 2)
(f 3)
; expect 4
y
; expect 2

;;; These are examples from several sections of "The Structure
;;; and Interpretation of Computer Programs" by Abelson and Sussman.

;;; License: Creative Commons share alike with attribution

;;; 1.1.1

10
; expect 10

(+ 137 349)
; expect 486

(- 1000 334)
; expect 666

(* 5 99)
; expect 495

(/ 10 5)
; expect 2

(+ 2.7 10)
; expect 12.7

(+ 21 35 12 7)
; expect 75

(* 25 4 12)
; expect 1200

(+ (* 3 5) (- 10 6))
; expect 19

(+ (* 3 (+ (* 2 4) (+ 3 5))) (+ (- 10 7) 6))
; expect 57

(+ (* 3
      (+ (* 2 4)
         (+ 3 5)))
   (+ (- 10 7)
      6))
; expect 57


;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;; Move the following (exit) line to run additional tests. ;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;



;;; 1.1.2

(define size 2)
size
; expect 2

(* 5 size)
; expect 10

(define pi 3.14159)
(define radius 10)
(* pi (* radius radius))
; expect 314.159

(define circumference (* 2 pi radius))
circumference
; expect 62.8318

;;; 1.1.4

(define (square x) (* x x))
(square 21)
; expect 441

(define square (lambda (x) (* x x))) ; See Section 1.3.2
(square 21)
; expect 441

(square (+ 2 5))
; expect 49

(square (square 3))
; expect 81

(define (sum-of-squares x y)
  (+ (square x) (square y)))
(sum-of-squares 3 4)
; expect 25

(define (f a)
  (sum-of-squares (+ a 1) (* a 2)))
(f 5)
; expect 136

;;; 1.1.6

(define (abs x)
  (cond ((> x 0) x)
        ((= x 0) 0)
        ((< x 0) (- x))))
(abs -3)
; expect 3

(abs 0)
; expect 0

(abs 3)
; expect 3

(define (a-plus-abs-b a b)
  ((if (> b 0) + -) a b))
(a-plus-abs-b 3 -2)
; expect 5

;;; 1.1.7

(define (sqrt-iter guess x)
  (if (good-enough? guess x)
      guess
      (sqrt-iter (improve guess x)
                 x)))
(define (improve guess x)
  (average guess (/ x guess)))
(define (average x y)
  (/ (+ x y) 2))
(define (good-enough? guess x)
  (< (abs (- (square guess) x)) 0.001))
(define (sqrt x)
  (sqrt-iter 1.0 x))
(sqrt 9)
; expect 3.00009155413138

(sqrt (+ 100 37))
; expect 11.704699917758145

(sqrt (+ (sqrt 2) (sqrt 3)))
; expect 1.7739279023207892

(square (sqrt 1000))
; expect 1000.000369924366

;;; 1.1.8

(define (sqrt x)
  (define (good-enough? guess)
    (< (abs (- (square guess) x)) 0.001))
  (define (improve guess)
    (average guess (/ x guess)))
  (define (sqrt-iter guess)
    (if (good-enough? guess)
        guess
        (sqrt-iter (improve guess))))
  (sqrt-iter 1.0))
(sqrt 9)
; expect 3.00009155413138

(sqrt (+ 100 37))
; expect 11.704699917758145

(sqrt (+ (sqrt 2) (sqrt 3)))
; expect 1.7739279023207892

(square (sqrt 1000))
; expect 1000.000369924366

;;; 1.3.1

(define (cube x) (* x x x))
(define (sum term a next b)
  (if (> a b)
      0
      (+ (term a)
         (sum term (next a) next b))))
(define (inc n) (+ n 1))
(define (sum-cubes a b)
  (sum cube a inc b))
(sum-cubes 1 10)
; expect 3025

(define (identity x) x)
(define (sum-integers a b)
  (sum identity a inc b))
(sum-integers 1 10)
; expect 55

;;; 1.3.2

((lambda (x y z) (+ x y (square z))) 1 2 3)
; expect 12

(define (f x y)
  (let ((a (+ 1 (* x y)))
        (b (- 1 y)))
    (+ (* x (square a))
       (* y b)
       (* a b))))
(f 3 4)
; expect 456

(define x 5)
(+ (let ((x 3))
     (+ x (* x 10)))
   x)
; expect 38

(let ((x 3)
      (y (+ x 2)))
  (* x y))
; expect 21

;;; 2.1.1

(define (add-rat x y)
  (make-rat (+ (* (numer x) (denom y))
               (* (numer y) (denom x)))
            (* (denom x) (denom y))))
(define (sub-rat x y)
  (make-rat (- (* (numer x) (denom y))
               (* (numer y) (denom x)))
            (* (denom x) (denom y))))
(define (mul-rat x y)
  (make-rat (* (numer x) (numer y))
            (* (denom x) (denom y))))
(define (div-rat x y)
  (make-rat (* (numer x) (denom y))
            (* (denom x) (numer y))))
(define (equal-rat? x y)
  (= (* (numer x) (denom y))
     (* (numer y) (denom x))))

(define x (cons 1 2))
(car x)
; expect 1

(cdr x)
; expect 2

(define x (cons 1 2))
(define y (cons 3 4))
(define z (cons x y))
(car (car z))
; expect 1

(car (cdr z))
; expect 3

z
; expect ((1 . 2) 3 . 4)

(define (make-rat n d) (cons n d))
(define (numer x) (car x))
(define (denom x) (cdr x))
(define (print-rat x)
  (display (numer x))
  (display '/)
  (display (denom x))
  (newline))
(define one-half (make-rat 1 2))
(print-rat one-half)
; expect 1/2

(define one-third (make-rat 1 3))
(print-rat (add-rat one-half one-third))
; expect 5/6

(print-rat (mul-rat one-half one-third))
; expect 1/6

(print-rat (add-rat one-third one-third))
; expect 6/9

(define (gcd a b)
  (if (= b 0)
      a
      (gcd b (remainder a b))))
(define (make-rat n d)
  (let ((g (gcd n d)))
    (cons (/ n g) (/ d g))))
(print-rat (add-rat one-third one-third))
; expect 2/3

(define one-through-four (list 1 2 3 4))
one-through-four
; expect (1 2 3 4)

(car one-through-four)
; expect 1

(cdr one-through-four)
; expect (2 3 4)

(car (cdr one-through-four))
; expect 2

(cons 10 one-through-four)
; expect (10 1 2 3 4)

(cons 5 one-through-four)
; expect (5 1 2 3 4)

(define (map proc items)
  (if (null? items)
      nil
      (cons (proc (car items))
            (map proc (cdr items)))))
(map abs (list -10 2.5 -11.6 17))
; expect (10 2.5 11.6 17)

(map (lambda (x) (* x x))
     (list 1 2 3 4))
; expect (1 4 9 16)

(define (scale-list items factor)
  (map (lambda (x) (* x factor))
       items))
(scale-list (list 1 2 3 4 5) 10)
; expect (10 20 30 40 50)

(define (count-leaves x)
  (cond ((null? x) 0)
        ((not (pair? x)) 1)
        (else (+ (count-leaves (car x))
                 (count-leaves (cdr x))))))
(define x (cons (list 1 2) (list 3 4)))
(count-leaves x)
; expect 4

(count-leaves (list x x))
; expect 8

;;; 2.2.3

(define (odd? x) (= 1 (remainder x 2)))
(define (filter predicate sequence)
  (cond ((null? sequence) nil)
        ((predicate (car sequence))
         (cons (car sequence)
               (filter predicate (cdr sequence))))
        (else (filter predicate (cdr sequence)))))
(filter odd? (list 1 2 3 4 5))
; expect (1 3 5)

(define (accumulate op initial sequence)
  (if (null? sequence)
      initial
      (op (car sequence)
          (accumulate op initial (cdr sequence)))))
(accumulate + 0 (list 1 2 3 4 5))
; expect 15

(accumulate * 1 (list 1 2 3 4 5))
; expect 120

(accumulate cons nil (list 1 2 3 4 5))
; expect (1 2 3 4 5)

(define (enumerate-interval low high)
  (if (> low high)
      nil
      (cons low (enumerate-interval (+ low 1) high))))
(enumerate-interval 2 7)
; expect (2 3 4 5 6 7)

(define (enumerate-tree tree)
  (cond ((null? tree) nil)
        ((not (pair? tree)) (list tree))
        (else (append (enumerate-tree (car tree))
                      (enumerate-tree (cdr tree))))))
(enumerate-tree (list 1 (list 2 (list 3 4)) 5))
; expect (1 2 3 4 5)

;;; 2.3.1

(define a 1)

(define b 2)

(list a b)
; expect (1 2)

(list 'a 'b)
; expect (a b)

(list 'a b)
; expect (a 2)

(car '(a b c))
; expect a

(cdr '(a b c))
; expect (b c)

(define (memq item x)
  (cond ((null? x) false)
        ((eq? item (car x)) x)
        (else (memq item (cdr x)))))
(memq 'apple '(pear banana prune))
; expect False

(memq 'apple '(x (apple sauce) y apple pear))
; expect (apple pear)

(define (equal? x y)
  (cond ((pair? x) (and (pair? y)
                        (equal? (car x) (car y))
                        (equal? (cdr x) (cdr y))))
        ((null? x) (null? y))
        (else (eq? x y))))
(equal? '(1 2 (three)) '(1 2 (three)))
; expect True

(equal? '(1 2 (three)) '(1 2 three))
; expect False

(equal? '(1 2 three) '(1 2 (three)))
; expect False

;;; Peter Norvig tests (http://norvig.com/lispy2.html)

(define double (lambda (x) (* 2 x)))
(double 5)
; expect 10

(define compose (lambda (f g) (lambda (x) (f (g x)))))
((compose list double) 5)
; expect (10)

(define apply-twice (lambda (f) (compose f f)))
((apply-twice double) 5)
; expect 20

((apply-twice (apply-twice double)) 5)
; expect 80

(define fact (lambda (n) (if (<= n 1) 1 (* n (fact (- n 1))))))
(fact 3)
; expect 6

(fact 50)
; expect 30414093201713378043612608166064768844377641568960512000000000000

(define (combine f)
  (lambda (x y)
    (if (null? x) nil
      (f (list (car x) (car y))
         ((combine f) (cdr x) (cdr y))))))
(define zip (combine cons))
(zip (list 1 2 3 4) (list 5 6 7 8))
; expect ((1 5) (2 6) (3 7) (4 8))


(define (combine f)
  (lambda (x y)
    (if (null? x) nil
	(f (list (car x) (car y))
	   ((combine f) (cdr x) (cdr y))))))
(define riff-shuffle (lambda (deck) (begin
    (define take
      (lambda (n seq)
	(if (<= n 0)
	    (quote ())
	    (cons (car seq)
		  (take (- n 1)
			(cdr seq))))))
    (define drop
      (lambda (n seq)
	(if (<= n 0)
	    seq
	    (drop (- n 1)
		  (cdr seq)))))
    (define mid (lambda (seq) (/ (length seq) 2)))
    ((combine append) (take (mid deck) deck) (drop (mid deck) deck)))))
(riff-shuffle (list 1 2 3 4 5 6 7 8))
; expect (1 5 2 6 3 7 4 8)

((apply-twice riff-shuffle) (list 1 2 3 4 5 6 7 8))
; expect (1 3 5 7 2 4 6 8)

(riff-shuffle (riff-shuffle (riff-shuffle (list 1 2 3 4 5 6 7 8))))
; expect (1 2 3 4 5 6 7 8)

;;; Additional tests

(apply square '(2))
; expect 4

(apply + '(1 2 3 4))
; expect 10

(apply (if false + append) '((1 2) (3 4)))
; expect (1 2 3 4)

(if 0 1 2)
; expect 1

(if '() 1 2)
; expect 1

(or false true)
; expect True

(or)
; expect False

(and)
; expect True

(or 1 2 3)
; expect 1

(and 1 2 3)
; expect 3

(if nil 1 2)
; expect 1

(if 0 1 2)
; expect 1

(if (or false False #f) 1 2)
; expect 2

(define (loop) (loop))
(cond (false (loop))
      (12))
; expect 12

((lambda (x) (display x) (newline) x) 2)
; expect 2
; expect 2

; very weird
;(define f (lambda (x y . z) z))
;(f 1 2 3 4 5)
;; expect (3 4 5)

(define g (mu () x))
(define (high f x)
  (f))

(high g 2)
; expect 2

(define (print-and-square x)
  (print x)
  (square x))
(print-and-square 12)
; expect 12
; expect 144

(/ 1 0)
; expect Error

(define addx (mu (x) (+ x y)))
(define add2xy (lambda (x y) (addx (+ x x))))
(add2xy 3 7)
; expect 13


;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;; Scheme Implementations ;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

;; len outputs the length of list s
(define (len s)
  (if (eq? s '())
    0
    (+ 1 (len (cdr s)))))
(len '(1 2 3 4))
; expect 4

; Problem 18

;; Merge two lists LIST1 and LIST2 and returns
;; the merged lists.
(define (merge list1 list2)
    ; *** YOUR CODE HERE ***
    (cond ((null? list1) list2)
	  ((null? list2) list1)
	  ((> (car list1) (car list2))
	   (cons (car list2)
		 (merge list1 (cdr list2))))
	  (else (cons (car list1)
		      (merge list2 (cdr list1))))))

(merge '(1 5 7 9) '(4 8 10))
; expect (1 4 5 7 8 9 10)

; CY
;(merge '(2 3 4) '(2 3 3 5))
;; expect (2 2 3 3 3 4 5)

;(merge '(2 3 4) '(0 1 5))
;; expect (0 1 2 3 4 5)

;(merge '() '())
;; expect ()

; Problem A19

;; The number of ways to change TOTAL with DENOMS
;; At most MAX-COINS total coins can be used.
(define (count-change total denoms max-coins)
  ; *** YOUR CODE HERE ***
  (cond ((= total 0) 1)
	((or (< total 0)
	     (null? denoms)
	     (= max-coins 0)) 0)
	(else (+ (count-change total
			       (cdr denoms)
			       max-coins)
		 (count-change (- total (car denoms))
			       denoms
			       (- max-coins 1))))))

(define us-coins '(50 25 10 5 1))
(count-change 20 us-coins 18)
; expect 8

; CY
;(count-change 100 us-coins 100)
;; expect 292

;(count-change 0 us-coins 1)
;; expect 1

;(count-change 20 us-coins 100)
;;


; Problem B20

;; The number of ways to partition TOTAL, where
;; each partition must be at most MAX-VALUE
(define (count-partitions total max-value)
  ; *** YOUR CODE HERE ***
  (if (or (= max-value 1)
	  (= total 0))
      1
      (begin (define (sum-part total)
	       (if (> 0 total)
		   0
		   (+ (sum-part (- total max-value)) 
		      (count-partitions total (- max-value 1)))))
	     (sum-part total))))

(count-partitions 5 3)
; expect 5

; CY
;(count-partitions 63 4)
;; expect 2178

;(count-partitions 100 3)
;; expect 884

;(count-partitions 10 10)
;; expect 42

; Note: The 5 partitions are [[3 2] [3 1 1] [2 2 1] [2 1 1 1] [1 1 1 1 1]]

; Problem 21

;; A list of all ways to partition TOTAL, where each partition must
;; be at most MAX-VALUE and there are at most MAX-PIECES partitions.
(define (list-partitions total max-pieces max-value)
  ; *** YOUR CODE HERE ***
  (define (append-to-each list item)
    (if (null? list)
	nil
	(cons (cons item (car list))
	      (append-to-each (cdr list) item))))
  (cond ((= total 0) '(()))
	((< total 0) nil)
	((<= max-pieces 0) nil)
	((< (* max-pieces max-value) total) nil)
	(else (append (append-to-each (list-partitions (- total max-value)
						       (- max-pieces 1)
						       max-value)
				      max-value)
		      (list-partitions total
				       max-pieces
				       (- max-value 1))))))

;; returns true if two lists of lists contains the same elements
(define (compare-lists list1 list2)
  (define (equal-list? list1 list2)
    (cond ((and (null? list1)
		(null? list2)) #t)
	  ((or (null? list1)
	       (null? list2)) #f)
	  (else (and (eq? (car list1)
			  (car list2))
		     (equal-list? (cdr list1)
				  (cdr list2))))))
  (define (remove-item list item)
    (cond ((null? list) nil)
	  ((equal-list? (car list) item)
	   (cdr list))
	  (else (cons (car list)
		      (remove-item (cdr list) item)))))
  (cond ((eq? list1 list2) #t)
	((and (null? list1)
	      (null? list2)) #t)
	((or (null? list1)
	     (null? list2)) #f)
	(else (compare-lists (cdr list1)
			     (remove-item list2
					  (car list1))))))
(compare-lists (list-partitions 5 2 4)
	       '((4 1) (3 2)))
; expect True

(compare-lists (list-partitions 7 3 5)
	       '((5 1 1) (4 2 1) (3 3 1) (3 2 2) (5 2) (4 3)))
; expect True

(compare-lists (list-partitions 10 10 10) '((10) (9 1) (8 2) (7 3) (6 4) (5 5) (4 4 2) (4 3 3) (5 3 2) (5 4 1) (6 2 2) (6 3 1) (7 2 1) (8 1 1) (7 1 1 1) (6 2 1 1) (6 1 1 1 1) (5 3 1 1) (5 2 2 1) (5 2 1 1 1) (5 1 1 1 1 1) (4 4 1 1)  (4 3 2 1) (4 3 1 1 1) (4 2 2 2) (4 2 2 1 1) (4 2 1 1 1 1) (4 1 1 1 1 1 1) (3 3 3 1) (3 3 2 2) (3 3 2 1 1) (3 3 1 1 1 1) (3 2 2 2 1) (3 2 2 1 1 1) (3 2 1 1 1 1 1) (3 1 1 1 1 1 1 1) (2 2 2 2 2) (2 2 2 2 1 1) (2 2 2 1 1 1 1) (2 2 1 1 1 1 1 1) (2 1 1 1 1 1 1 1 1) (1 1 1 1 1 1 1 1 1 1)))
; expect True

; Draw the hax image using turtle graphics.
(define (hax n k)
  ; *** YOUR CODE HERE ***
  
  nil)


;;;;;;;;;;;;;;;;;;;;
;;; Extra credit ;;;
;;;;;;;;;;;;;;;;;;;;

; Tail call optimization test
(define (sum n total)
  (if (zero? n) total
    (sum (- n 1) (+ n total))))
(sum 1001 0)
; expect 501501

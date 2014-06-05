function ouijaKeyboard(){
	var self = this;
	self.thread;
	self.bShift = false;
	self.bCaps = false;
	self.special_chars = { '`':'~', '1':'!', '2':'@', '3':'#', '4':'$', '5':'%', '6':'^', '7':'&', '8':'*', '9':'(', '0':')', '-':'_', '=':'+', '[':'{', ']':'}', ';':':', "'":'"', ',':'<', '.':'>', '/':'?', '\\':'|' };

	self.KeyClick = function(char){
		output = self.$text.val();
		switch(char){
			case 'l_shift':
			case 'r_shift':
				char = '';
				self.ShiftToggle();
				break;
			case 'caps':
				char = '';
				self.CapsToggle();
			  break;
			case 'enter':
				char = '\n';
				break;
			case 'space':
				char = ' ';
				break;
			case 'tab':
				char = '    ';
				break;
			case 'bs':
				char = '';
				output = output.substring(0, output.length - 1);
				break;
			case 'l_ctrl':
			case 'start':
			case 'l_alt':
			case 'r_alt':
			case 'print':
			case 'r_ctrl':
			case 'arrow':
				char = '';
				break;
			default:
			  if (bShift){ // is shifted, convert to upper
					char = char.toUpperCase();
					char = special_chars[char] || char; // lookup special chars
					self.ShiftToggle(); // undo shift
				}
			  else if (bCaps){ // is caps lock, convert to upper
					char = char.toUpperCase();
				}
		}

		self.$text.val(output + char); // new output is current + char
		self.$keyboard_large_div.css('display','none');
		//self.$status.html('');
	}

	self.keyLookup = function(pos){
		$('area').each(function() {
	    var coords = $(this).attr('coords').split(',');
	    if (pos.x >= coords[0] && pos.y >= coords[1] && pos.x <= coords[2] && pos.y <= coords[3]){
	    	self.KeyClick($(this).attr('alt'));
	    	console.log('keylookup '+$(this).attr('alt'));
	    }
		});
	}

	self.CopyToClipboard = function(){
		var text = self.$text.val();
		console.log('$.copy '+text);
		self.$text.copy();
		//$.copy(text);
		self.$status.html('Copied!');
	}

	self.SelectText = function(){
		/*
		var text = document.getElementById('text_output');
		text.selectionStart = 0;
		text.selectionEnd = text.value.length;
		//*/
		self.$text.focus();
		self.$text.select();
		self.$status.html('Selected!');
	}

	self.ShiftToggle = function(){
		self.bShift = (self.bShift) ? false : true;
		self.$status.html('Shift: ' + self.bShift);
	}

	self.CapsToggle = function(){
		self.bCaps = (self.bCaps) ? false : true;
		self.$status.html('Caps: ' + self.bCaps);
	}

	self.onMouseStop = function(){
		console.log('mouse stopped at '+window.mouseXPos+','+window.mouseYPos);
		/*
		var e = new jQuery.Event('click');
		e.pageX = window.mouseXPos;
		e.pageY = window.mouseYPos;
		self.$keyboard_small.trigger(e);
		//*/
		self.keyLookup({x: ((window.mouseXPos - self.$keyboard_small.offset().left) * 2), y: ((window.mouseYPos - self.$keyboard_small.offset().top) * 2)})
	}, self.thread;

	self.init = function(params){
	 	$(document).mousemove(function(e){ // save mouse coords
      window.mouseXPos = e.pageX;
      window.mouseYPos = e.pageY;
   	});

		self.$keyboard = $('.ouijaKeyboard');
		self.$status = $('#status');
		self.$keyboard_small = $('#keyboard_small');
		self.$keyboard_large = $('#keyboard_large');
		self.$keyboard_large_div = $('#keyboard_large_div');
		self.$text = $('#text_output');

		self.$keyboard.on('mousemove', '#keyboard_small', function(e){
			console.log('mouse moved');
			clearTimeout(self.thread);
			self.thread = setTimeout(self.onMouseStop, 300);
		});

		self.$keyboard.on('click', '#keyboard_small', function(e){
			clearTimeout(self.thread);
			//thread = setTimeout(onMouseStop, 300);
			var x = e.pageX - $(this).offset().left;
			var y = e.pageY - $(this).offset().top;
			var kb_width = $(this).width();
			var kb_height = $(this).height();

			var box_size = kb_height / 2;
			var box = {};

			// x-axis - horizontal
			if (x - (box_size / 2) < 0){
				console.log('x-axis - box extends before');
				box.left = 0;
				box.right = box_size;
			}
			else if (x + (box_size / 2) > kb_width){
				console.log('x-axis - box extends after');
				box.left = kb_width - box_size;
				box.right = kb_width;
			}
			else{
				console.log('x-axis - box falls in range without conflict');
				box.left = x - (box_size / 2);
				box.right = x + (box_size / 2);
			}

			// y-axis - vertical
			if (y - (box_size / 2) < 0){
				console.log('y-axis - box extends above');
				box.top = 0;
				box.bottom = box_size;
			}
			else if (y + (box_size / 2) > kb_height){
				console.log('y-axis - box extends below');
				box.top = kb_height - box_size;
				box.bottom = kb_height;
			}
			else{
				console.log('y-axis - box falls in range without conflict');
				box.top = y - (box_size / 2);
				box.bottom = y + (box_size / 2);
			}

			//rect (top, right, bottom, left)
			self.$keyboard_large.css('clip','rect(' + (box.top * 2) + 'px,' + (box.right * 2) + 'px,' + (box.bottom * 2) + 'px,' + (box.left * 2) + 'px)');

			shift_left = e.pageX - box_size - ((x - (box_size / 2)) * 2); // point move left for box size + reset to origin
			shift_top = e.pageY - box_size - ((y - (box_size / 2)) * 2);

			console.log('$(this).offset().left: '+$(this).offset().left+' $(this).offset().top: '+$(this).offset().top);
			console.log('x: '+x+' y:'+y);
			console.log('kb_width: '+kb_width+' kb_height:'+kb_height);
			console.log('box: '+JSON.stringify(box));
			console.log('e.pageX: '+e.pageX+' e.pageY: '+e.pageY);
			console.log('shift_left: '+shift_left+' shift_top: '+shift_top);

			self.$keyboard_large.css('left',shift_left+'px');
			self.$keyboard_large.css('top',shift_top+'px');

			self.$keyboard_large_div.css('display','inline');
		});

		self.$keyboard.on('click', 'area', function(e){
			var x = e.pageX - $(this).offset().left;
			var y = e.pageY - $(this).offset().top;
			//var coords = $(this).attr('coords').split(',');
			var alt = $(this).attr('alt');
			self.KeyClick(alt);
		});

		self.$keyboard.on('click', '#select_text', function(){
			self.SelectText();
		});

		self.$keyboard.on('click', '#copy_text', function(){
			self.CopyToClipboard();
		});

		/*
		//ZeroClipboard.config( { moviePath: 'js/ZeroClipboard.swf' } );
		self.$clip = new ZeroClipboard( $('#copy_text') );

		self.$clip.on( 'ready', function( readyEvent ){
		  console.log('ZeroClipboard SWF is ready!');
		  self.$clip.on( 'copy', function(clip){
				var text = self.$text.val();
				console.log('clip.setText '+text);
				clip.setText(text);
		  });

		  self.$clip.on( 'aftercopy', function( event ){
		    self.$status.html('Copied!'); // event.data["text/plain"]
		  });
		});
		//*/
	}();
}
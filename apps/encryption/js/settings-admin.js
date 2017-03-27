/**
 * Copyright (c) 2013
 *  Sam Tuke <samtuke@owncloud.com>
 *  Robin Appelman <icewind1991@gmail.com>
 *  Bjoern Schiessle <schiessle@owncloud.com>
 * This file is licensed under the Affero General Public License version 3 or later.
 * See the COPYING-README file.
 */

$(document).ready(function () {

	//This function is to arrange the display of the encryption page
	//in the settings.
	function encryptionTypeSelection(encryptionType, state=undefined) {
		if (encryptionType === "masterkey") {
			//If user selects "Master Key" from the drop down
			$("#select-mode").removeClass("hidden");

			$("#encryptHomeStorageSetting, #encryptionSetRecoveryKey").addClass("hidden");

			if(state === "static") {
				$("#select-mode, #keyTypeId").addClass("hidden");
				$("#encryptHomeStorage, #encryptionSetRecoveryKey").addClass("hidden");
				if($("#encryptionType").text().trim().length === 0) {
					$("#encryptionType").text("Encryption type: Master Key");
				}
			}
		} else if (encryptionType === "customkey") {
			//If user selects "User-specific key" from the drop down
			$("#select-mode").removeClass("hidden");

			$("#encryptHomeStorageSetting, #encryptionSetRecoveryKey").removeClass("hidden");

			if(state === "static") {
				$("#keyTypeId, #select-mode").addClass("hidden");
			}
		} else {
			//If user selects "Please sect an encryption option" from the drop down
			$("#select-mode").addClass("hidden");
			$("#encryptHomeStorageSetting, #encryptionSetRecoveryKey").addClass("hidden");
		}

	}

	encryptionTypeSelection($("#keyTypeId :selected").val(), "static");

	OC.AppConfig.getValue("encryption", "useMasterKey", function ($value) {
		if($value === "") {
			OC.AppConfig.getValue("encryption", "encryptHomeStorage", function ($homevalue) {
				if ($homevalue !== '') {

					encryptionTypeSelection("customkey", "static");
				}
			});
		}
	});

	$("#keyTypeId").change(function (element) {
		encryptionTypeSelection($("#keyTypeId :selected").val());
	});

	$("#select-mode").click(function () {
		//Action to be taken when "Select this mode" button is selected.
		$("#select-mode,#keyTypeId").addClass("hidden");
		if($("#keyTypeId :selected").val() === "masterkey") {
			$.when(OC.AppConfig.setValue("encryption", "encryptHomeStorage", '0'),
				OC.AppConfig.setValue('encryption', 'useMasterKey', '1')).then(function () {
					location.reload();
			});
		} else if($("#keyTypeId :selected").val() === "customkey") {
			if($("#encryptHomeStorage").prop("checked") === true) {
				OC.AppConfig.setValue("encryption", "encryptHomeStorage", '1');
			} else {
				OC.AppConfig.setValue("encryption", "encryptHomeStorage", '0');
			}
			if($("#encryptionType").text().trim().length === 0) {
				$("#encryptionType").text("Encryption type: User Specific Key");
			}
		}
	});

	$('input:button[name="enableRecoveryKey"]').click(function () {

		var recoveryStatus = $(this).attr('status');
		var newRecoveryStatus = (1 + parseInt(recoveryStatus)) % 2;
		var buttonValue = $(this).attr('value');

		var recoveryPassword = $('#encryptionRecoveryPassword').val();
		var confirmPassword = $('#repeatEncryptionRecoveryPassword').val();
		OC.msg.startSaving('#encryptionSetRecoveryKey .msg');
		$.post(
			OC.generateUrl('/apps/encryption/ajax/adminRecovery'),
			{
				adminEnableRecovery: newRecoveryStatus,
				recoveryPassword: recoveryPassword,
				confirmPassword: confirmPassword
			}
		).done(function (data) {
				OC.msg.finishedSuccess('#encryptionSetRecoveryKey .msg', data.data.message);

				if (newRecoveryStatus === 0) {
					$('p[name="changeRecoveryPasswordBlock"]').addClass("hidden");
					$('input:button[name="enableRecoveryKey"]').attr('value', 'Enable recovery key');
					$('input:button[name="enableRecoveryKey"]').attr('status', '0');
				} else {
					$('input:password[name="changeRecoveryPassword"]').val("");
					$('p[name="changeRecoveryPasswordBlock"]').removeClass("hidden");
					$('input:button[name="enableRecoveryKey"]').attr('value', 'Disable recovery key');
					$('input:button[name="enableRecoveryKey"]').attr('status', '1');
				}
			})
			.fail(function (jqXHR) {
				$('input:button[name="enableRecoveryKey"]').attr('value', buttonValue);
				$('input:button[name="enableRecoveryKey"]').attr('status', recoveryStatus);
				OC.msg.finishedError('#encryptionSetRecoveryKey .msg', JSON.parse(jqXHR.responseText).data.message);
			});


	});

	$("#repeatEncryptionRecoveryPassword").keyup(function (event) {
		if (event.keyCode == 13) {
			$("#enableRecoveryKey").click();
		}
	});

	// change recovery password

	$('button:button[name="submitChangeRecoveryKey"]').click(function () {
		var oldRecoveryPassword = $('#oldEncryptionRecoveryPassword').val();
		var newRecoveryPassword = $('#newEncryptionRecoveryPassword').val();
		var confirmNewPassword = $('#repeatedNewEncryptionRecoveryPassword').val();
		OC.msg.startSaving('#encryptionChangeRecoveryKey .msg');
		$.post(
			OC.generateUrl('/apps/encryption/ajax/changeRecoveryPassword'),
			{
				oldPassword: oldRecoveryPassword,
				newPassword: newRecoveryPassword,
				confirmPassword: confirmNewPassword
			}
		).done(function (data) {
				OC.msg.finishedSuccess('#encryptionChangeRecoveryKey .msg', data.data.message);
			})
			.fail(function (jqXHR) {
				OC.msg.finishedError('#encryptionChangeRecoveryKey .msg', JSON.parse(jqXHR.responseText).data.message);
			});
	});

	$('#encryptHomeStorage').change(function() {
		$.post(
			OC.generateUrl('/apps/encryption/ajax/setEncryptHomeStorage'),
			{
				encryptHomeStorage: this.checked
			}
		);
	});

});
